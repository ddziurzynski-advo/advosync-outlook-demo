/*
  Wspólna część panelu – ta sama w Outlooku i w Gmailu:
  podpowiedzi, lista wszystkich odpowiedzi, podgląd szkicu i przycisk „Użyj”.
  Z pocztą łączy się przez „łącznik”: taskpane.js (Outlook) albo gmail-panel.js (Gmail).

  Zasada: treść maila jest czytana tylko w pamięci panelu.
  Nigdzie jej nie wysyłamy, nie zapisujemy i nie wypisujemy do konsoli.
*/
(function (root) {
  "use strict";

  const $ = (id) => document.getElementById(id);
  let baza = null;
  let host = null; // { wstawSzkic(html) } – łącznik z pocztą; null poza pocztą
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

  function bezpieczny(tekst) {
    return tekst.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Szkic w HTML do okna odpowiedzi: akapity jak w programie pocztowym, pola do uzupełnienia na żółtym tle.
  // Wstawiamy wyłącznie treść odpowiedzi – bez stopki, reklamy ani linku.
  function htmlSzkicu(odpowiedz) {
    return odpowiedz.tresc
      .map((t) => bezpieczny(t).replace(/\[[^\]]+\]/g, (pole) => `<span style="background-color:#FCEFA1">${pole}</span>`))
      .map((t) => `<div>${t}</div>`)
      .join("<div><br></div>");
  }

  // Otwiera odpowiedź (tylko do nadawcy) ze szkicem. Niczego nie wysyła – wysyła prawnik.
  function uzyj(odpowiedz, info) {
    if (!host) {
      info.textContent = "Wstawianie działa wewnątrz poczty.";
      return;
    }
    info.textContent = "Otwieram odpowiedź…";
    Promise.resolve()
      .then(() => host.wstawSzkic(htmlSzkicu(odpowiedz)))
      .then(() => { info.textContent = "Szkic otwarty w oknie odpowiedzi. Uzupełnij pola na żółto, sprawdź treść i wyślij sam."; })
      .catch((e) => { info.textContent = (e && e.komunikat) || "Nie udało się otworzyć okna odpowiedzi. Spróbuj ponownie."; });
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

    const akcje = el("div", "akcje");
    const przycisk = el("button", "btn", "Użyj");
    przycisk.type = "button";
    przycisk.setAttribute("aria-label", `Użyj odpowiedzi ${odpowiedz.numer}: ${odpowiedz.tytul}`);
    const info = el("p", "info");
    info.setAttribute("aria-live", "polite");
    przycisk.addEventListener("click", () => uzyj(odpowiedz, info));
    akcje.append(przycisk, info);
    li.append(akcje);
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

  async function wczytajLokalnie() {
    const odp = await fetch("odpowiedzi.json", { cache: "no-cache" });
    if (!odp.ok) throw new Error();
    return odp.json();
  }

  root.Panel = {
    /*
      Uruchamia panel. lacznik – { wstawSzkic(html) } albo null poza pocztą.
      Zwraca true, gdy baza odpowiedzi się wczytała.
    */
    async uruchom(lacznik, komunikatPoza, wczytajBaze) {
      host = lacznik;
      try {
        baza = await (wczytajBaze || wczytajLokalnie)();
      } catch (e) {
        komunikat("Nie udało się wczytać bazy odpowiedzi. Sprawdź plik odpowiedzi.json na stronie testy.html.");
        return false;
      }
      if (!host) {
        komunikat(komunikatPoza);
        pokazWszystkie(false);
      }
      return true;
    },

    // Otwarto nową wiadomość – pokazujemy temat, podpowiedzi pojawią się po odczytaniu treści.
    czekaj(temat) {
      komunikat(temat || "(bez tematu)");
      $("propozycje").hidden = true;
      $("brak").textContent = BRAK_DOMYSLNIE;
    },

    // mail: { temat, tresc, data }
    pokaz(mail) {
      pokazPropozycje(Dopasowanie.dopasuj(baza, mail));
    },

    bladOdczytu() {
      $("brak").textContent = "Nie udało się odczytać treści wiadomości. Wybierz odpowiedź ręcznie z listy poniżej.";
      pokazPropozycje([]);
    },

    brakWiadomosci() {
      komunikat("Otwórz wiadomość, aby zobaczyć podpowiedzi.");
      $("propozycje").hidden = true;
      pokazWszystkie(false);
    },

    // "dark", "light" albo null (decyduje ustawienie systemu)
    ustawMotyw(motyw) {
      if (motyw) document.documentElement.dataset.theme = motyw;
      else delete document.documentElement.dataset.theme;
    },
  };
})(window);
