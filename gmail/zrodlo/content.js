/*
  Rozszerzenie „Szkic odpowiedzi dla kancelarii” – część działająca na stronie Gmaila.
  Robi trzy rzeczy:
    1. pokazuje przycisk „Szkic odpowiedzi” (tylko przy otwartej wiadomości) i panel boczny,
    2. odczytuje OTWARTĄ wiadomość – wyłącznie wtedy, gdy panel jest otwarty – i przekazuje ją do panelu,
    3. na prośbę panelu otwiera „Odpowiedz” i wstawia wybrany szkic.
  Niczego nie wysyła, nie zapisuje i nie wypisuje do konsoli.

  Gmail nie ma oficjalnego API dla rozszerzeń, więc korzystamy z jego stałych elementów strony
  (np. temat „h2.hP”, treść „div.a3s”). Jeśli Google zmieni wygląd Gmaila, te selektory trzeba będzie poprawić.
*/
(function () {
  "use strict";

  if (window.top !== window) return; // nie działamy w wewnętrznych ramkach Gmaila

  const PANEL_URL = chrome.runtime.getURL("panel.html");
  const PANEL_ORIGIN = new URL(PANEL_URL).origin;

  let przycisk, okno, ramka;
  let otwarty = false;
  let gotowy = false;     // panel wczytał bazę odpowiedzi
  let ostatniKlucz = null; // rozpoznaje, że prawnik otworzył inny mail

  // ---------- Elementy strony Gmaila ----------

  const widoczny = (e) => !!e && e.offsetParent !== null;
  const glowny = () => [...document.querySelectorAll('div[role="main"]')].find(widoczny) || null;

  function tematElement() {
    return [...document.querySelectorAll("h2.hP")].find(widoczny) || null;
  }

  function trescElementy() {
    const m = glowny();
    return m ? [...m.querySelectorAll("div.a3s")].filter(widoczny) : [];
  }

  // Data w podpowiedzi Gmaila, np. „pt., 6 lis 2026, 21:40” albo „Fri, Nov 6, 2026, 9:40 PM”.
  const MIESIACE = { sty: 0, jan: 0, lut: 1, feb: 1, mar: 2, kwi: 3, apr: 3, maj: 4, may: 4, cze: 5, jun: 5,
    lip: 6, jul: 6, sie: 7, aug: 7, wrz: 8, sep: 8, paz: 9, oct: 9, lis: 10, nov: 10, gru: 11, dec: 11 };

  function parsujDate(tekst) {
    if (!tekst) return null;
    const n = tekst.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");
    const mies = n.match(/\b(sty|jan|lut|feb|mar|kwi|apr|maj|may|cze|jun|lip|jul|sie|aug|wrz|sep|paz|oct|lis|nov|gru|dec)[a-z]*\.?/);
    const rok = n.match(/\b(20\d\d)\b/);
    const godz = n.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
    if (!mies || !rok || !godz) return null;
    const dzien = (n.match(new RegExp("(\\d{1,2})\\s+" + mies[0].replace(".", "\\."))) ||
                   n.match(new RegExp(mies[0].replace(".", "\\.") + "\\s+(\\d{1,2})\\b")) || [])[1];
    if (!dzien) return null;
    let h = Number(godz[1]);
    if (godz[3] === "pm" && h < 12) h += 12;
    if (godz[3] === "am" && h === 12) h = 0;
    const d = new Date(Number(rok[1]), MIESIACE[mies[1]], Number(dzien), h, Number(godz[2]));
    return isNaN(d) ? null : d;
  }

  // Ostatnia rozwinięta wiadomość w otwartym wątku – zwykle ta od klienta, na którą odpowiadamy.
  function odczytajWiadomosc() {
    const t = tematElement();
    if (!t) return null;
    const tresci = trescElementy();
    const ostatnia = tresci[tresci.length - 1];
    const wiadomosc = ostatnia && ostatnia.closest(".adn, .gs");
    const dataEl = wiadomosc && wiadomosc.querySelector("span.g3[title]");
    return {
      temat: t.textContent.trim(),
      tresc: ostatnia ? ostatnia.innerText : "",
      data: dataEl ? parsujDate(dataEl.getAttribute("title")) : null,
    };
  }

  function motywGmaila() {
    let e = glowny() || document.body;
    while (e) {
      const kolor = getComputedStyle(e).backgroundColor;
      const m = kolor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m && (m[4] === undefined || Number(m[4]) > 0.5)) {
        const jasnosc = (0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3]) / 255;
        return jasnosc < 0.5 ? "dark" : "light";
      }
      e = e.parentElement;
    }
    return null;
  }

  // ---------- Wstawianie szkicu ----------

  function edytorOdpowiedzi() {
    const m = glowny();
    if (!m) return null;
    const edytory = [...m.querySelectorAll('div[contenteditable="true"][role="textbox"], div.editable[contenteditable="true"]')].filter(widoczny);
    return edytory[edytory.length - 1] || null;
  }

  function przyciskOdpowiedz() {
    const m = glowny();
    if (!m) return null;
    const kandydaci = [
      ...m.querySelectorAll("span.ams.bkH"),
      ...m.querySelectorAll('[role="button"][aria-label="Odpowiedz"], [role="button"][aria-label="Reply"], [role="button"][data-tooltip="Odpowiedz"], [role="button"][data-tooltip="Reply"]'),
    ].filter(widoczny);
    return kandydaci[kandydaci.length - 1] || null;
  }

  function kliknij(e) {
    for (const typ of ["mousedown", "mouseup", "click"]) {
      e.dispatchEvent(new MouseEvent(typ, { bubbles: true, cancelable: true, view: window }));
    }
  }

  function czekajNa(znajdz, ms) {
    return new Promise((gotowe) => {
      const start = Date.now();
      (function sprawdz() {
        const wynik = znajdz();
        if (wynik || Date.now() - start > ms) return gotowe(wynik);
        setTimeout(sprawdz, 100);
      })();
    });
  }

  async function wstawSzkic(html) {
    let edytor = edytorOdpowiedzi();
    if (!edytor) {
      const odp = przyciskOdpowiedz();
      if (!odp) throw new Error("Nie znalazłem przycisku „Odpowiedz”. Kliknij go w Gmailu i ponownie wybierz „Użyj”.");
      kliknij(odp);
      edytor = await czekajNa(edytorOdpowiedzi, 5000);
      if (!edytor) throw new Error("Okno odpowiedzi się nie otworzyło. Kliknij „Odpowiedz” w Gmailu i ponownie wybierz „Użyj”.");
    }
    // Szkic trafia na początek odpowiedzi, nad podpis i cytat.
    edytor.focus();
    const zakres = document.createRange();
    zakres.setStart(edytor, 0);
    zakres.collapse(true);
    const zaznaczenie = window.getSelection();
    zaznaczenie.removeAllRanges();
    zaznaczenie.addRange(zakres);
    document.execCommand("insertHTML", false, html + "<div><br></div>");
  }

  // ---------- Komunikacja z panelem ----------

  function doPanelu(wiadomosc) {
    if (ramka && ramka.contentWindow) ramka.contentWindow.postMessage(wiadomosc, PANEL_ORIGIN);
  }

  function wyslijWiadomosc() {
    const mail = odczytajWiadomosc();
    doPanelu(mail ? { typ: "mail", mail } : { typ: "brak" });
  }

  window.addEventListener("message", async (e) => {
    if (!ramka || e.source !== ramka.contentWindow || e.origin !== PANEL_ORIGIN) return;
    const m = e.data || {};
    if (m.typ === "gotowy") {
      gotowy = true;
      doPanelu({ typ: "motyw", motyw: motywGmaila() });
      ostatniKlucz = null;
      sprawdz();
    } else if (m.typ === "zamknij") {
      zamknij();
    } else if (m.typ === "wstaw") {
      try {
        await wstawSzkic(String(m.html || ""));
        doPanelu({ typ: "wstawiono", id: m.id, ok: true });
      } catch (blad) {
        doPanelu({ typ: "wstawiono", id: m.id, ok: false, komunikat: blad.message });
      }
    }
  });

  // ---------- Przycisk i panel ----------

  function zbudujUI() {
    const kontener = document.createElement("div");
    kontener.id = "advosync-szkic-odpowiedzi";
    const cien = kontener.attachShadow({ mode: "closed" });
    cien.innerHTML = `
      <style>
        .otworz {
          position: fixed; right: 88px; bottom: 24px; z-index: 2147483000;
          padding: 10px 20px; border: 0; border-radius: 999px; cursor: pointer;
          background: #17181A; color: #F5F4F1;
          font: 600 14px/22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-shadow: 0 12px 28px -12px rgba(23,24,26,.5);
        }
        .otworz:hover { opacity: .86; }
        .otworz:focus-visible { outline: 2px solid #17181A; outline-offset: 3px; }
        .okno {
          position: fixed; top: 64px; right: 0; bottom: 0; width: 360px; max-width: 100vw; z-index: 2147483001;
          background: #FAFAF9; border-left: 1px solid #E3E1DB; box-shadow: -12px 0 32px -16px rgba(23,24,26,.35);
        }
        iframe { width: 100%; height: 100%; border: 0; display: block; }
        [hidden] { display: none !important; }
      </style>
      <button class="otworz" type="button" hidden>Szkic odpowiedzi</button>
      <div class="okno" hidden></div>`;
    przycisk = cien.querySelector(".otworz");
    okno = cien.querySelector(".okno");
    przycisk.addEventListener("click", otworz);
    document.body.append(kontener);
  }

  function otworz() {
    otwarty = true;
    przycisk.hidden = true;
    okno.hidden = false;
    if (!ramka) {
      ramka = document.createElement("iframe");
      ramka.title = "Szkic odpowiedzi dla kancelarii";
      ramka.src = PANEL_URL;
      okno.append(ramka);
    } else if (gotowy) {
      ostatniKlucz = null;
      sprawdz();
    }
  }

  function zamknij() {
    otwarty = false;
    okno.hidden = true;
    sprawdz();
  }

  // Co chwilę sprawdzamy, czy jest otwarta wiadomość. Treść odczytujemy tylko przy otwartym panelu.
  function sprawdz() {
    const jestWiadomosc = !!tematElement();
    przycisk.hidden = otwarty || !jestWiadomosc;
    if (!otwarty || !gotowy) return;
    const t = tematElement();
    const klucz = [location.hash, t ? t.textContent : "", trescElementy().length].join("|");
    if (klucz === ostatniKlucz) return;
    ostatniKlucz = klucz;
    wyslijWiadomosc();
  }

  zbudujUI();
  setInterval(sprawdz, 800);
})();
