/*
  Panel dodatku ADVOSYNC.
  Zasada: treść maila jest czytana tylko w pamięci tego panelu.
  Nigdzie jej nie wysyłamy, nie zapisujemy i nie wypisujemy do konsoli.
*/
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  let baza = null;
  let biezacyOdczyt = 0; // chroni przed spóźnionym wynikiem, gdy prawnik szybko przełącza maile
  const BRAK_DOMYSLNIE = $("brak").textContent;

  function el(tag, klasa, tekst) {
    const e = document.createElement(tag);
    if (klasa) e.className = klasa;
    if (tekst !== undefined) e.textContent = tekst;
    return e;
  }

  // Akapit szkicu z wyróżnionymi polami do uzupełnienia, np. [sygnatura akt].
  function akapit(tekst) {
    const p = el("p");
    tekst.split(/(\[[^\]]+\])/).forEach((kawalek) => {
      if (!kawalek) return;
      p.append(/^\[.+\]$/.test(kawalek) ? el("mark", "pole", kawalek) : document.createTextNode(kawalek));
    });
    return p;
  }

  function karta(odpowiedz, dopasowanie) {
    const li = el("li", "karta");
    li.append(el("p", "eyebrow", `${odpowiedz.numer} · ${odpowiedz.grupa}`));
    li.append(el("h3", "karta-tytul", odpowiedz.tytul));
    li.append(el("p", "sytuacja", odpowiedz.sytuacja));

    if (dopasowanie) {
      const sygnaly = dopasowanie.wykryto.slice(0, 4).map((s) => `„${s}”`).concat(dopasowanie.kontekst);
      li.append(el("p", "wykryto", "Wykryto: " + sygnaly.join(", ")));
    }

    const podglad = el("details", "podglad");
    podglad.append(el("summary", null, "Podgląd szkicu"));
    const szkic = el("div", "szkic");
    odpowiedz.tresc.forEach((t) => szkic.append(akapit(t)));
    podglad.append(szkic, el("p", "status", odpowiedz.status));
    li.append(podglad);
    return li;
  }

  function pokazWszystkie(rozwin) {
    const kontener = $("grupy");
    kontener.replaceChildren();
    for (const grupa of baza.grupy) {
      const odp = baza.odpowiedzi.filter((o) => o.grupa === grupa);
      const det = el("details", "grupa");
      det.open = rozwin;
      const sum = el("summary");
      sum.append(el("span", "grupa-nazwa", grupa), el("span", "grupa-numery", `${odp[0].numer}–${odp[odp.length - 1].numer}`));
      det.append(sum);
      const ol = el("ol", "karty");
      odp.forEach((o) => ol.append(karta(o)));
      det.append(ol);
      kontener.append(det);
    }
    $("wszystkie").hidden = false;
  }

  function pokazPropozycje(wyniki) {
    const lista = $("lista-propozycji");
    lista.replaceChildren();
    wyniki.forEach((w) => lista.append(karta(w.odpowiedz, w)));
    $("brak").hidden = wyniki.length > 0;
    $("propozycje").hidden = false;
    pokazWszystkie(wyniki.length === 0);
  }

  function komunikat(tekst) {
    $("temat").textContent = tekst;
  }

  function analizuj() {
    const item = Office.context.mailbox.item;
    const nr = ++biezacyOdczyt;
    $("propozycje").hidden = true;
    $("brak").textContent = BRAK_DOMYSLNIE;
    if (!item) {
      komunikat("Otwórz wiadomość, aby zobaczyć podpowiedzi.");
      return;
    }
    const temat = item.subject || "";
    komunikat(temat || "(bez tematu)");
    item.body.getAsync(Office.CoercionType.Text, (wynik) => {
      if (nr !== biezacyOdczyt) return;
      if (wynik.status !== Office.AsyncResultStatus.Succeeded) {
        $("brak").textContent = "Nie udało się odczytać treści wiadomości. Wybierz odpowiedź ręcznie z listy poniżej.";
        pokazPropozycje([]);
        return;
      }
      pokazPropozycje(Dopasowanie.dopasuj(baza, { temat, tresc: wynik.value, data: item.dateTimeCreated }));
    });
  }

  // Motyw: bierzemy kolor tła z Outlooka; jeśli Outlook go nie podaje, decyduje ustawienie systemu (CSS).
  function ustawMotyw() {
    const motyw = Office.context.officeTheme;
    if (!motyw || !motyw.bodyBackgroundColor) return;
    const hex = motyw.bodyBackgroundColor.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.substr(i, 2), 16));
    const jasnosc = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    document.documentElement.dataset.theme = jasnosc < 0.5 ? "dark" : "light";
  }

  async function wczytajBaze() {
    const odp = await fetch("odpowiedzi.json", { cache: "no-cache" });
    if (!odp.ok) throw new Error();
    return odp.json();
  }

  async function start(wOutlooku) {
    try {
      baza = await wczytajBaze();
    } catch (e) {
      komunikat("Nie udało się wczytać bazy odpowiedzi. Sprawdź plik odpowiedzi.json na stronie testy.html.");
      return;
    }
    if (!wOutlooku) {
      komunikat("Ten panel działa wewnątrz Outlooka. Poniżej podgląd bazy odpowiedzi.");
      pokazWszystkie(false);
      return;
    }
    ustawMotyw();
    analizuj();
    // Przypięty panel: odśwież, gdy prawnik otworzy inny mail.
    if (Office.context.requirements.isSetSupported("Mailbox", "1.5")) {
      Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, analizuj);
    }
  }

  if (typeof Office === "undefined") {
    start(false);
    return;
  }
  Office.onReady((info) => start(info.host === Office.HostType.Outlook));
})();
