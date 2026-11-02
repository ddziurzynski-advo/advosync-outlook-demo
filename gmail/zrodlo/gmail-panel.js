/*
  Łącznik panelu z Gmailem (rozszerzenie Chrome). Wygląd i logika panelu są w panel.js.
  Panel działa w osobnej, odizolowanej ramce rozszerzenia; z Gmailem rozmawia tylko przez content.js.
  Zasada: treść maila jest czytana tylko w pamięci panelu.
  Nigdzie jej nie wysyłamy, nie zapisujemy i nie wypisujemy do konsoli.
*/
(function () {
  "use strict";

  // Baza odpowiedzi – ta sama co w Outlooku. Gdy serwer jest niedostępny, używamy kopii z rozszerzenia.
  const ADRES_BAZY = "https://ddziurzynski-advo.github.io/advosync-outlook-demo/odpowiedzi.json";
  const GMAIL = "https://mail.google.com";

  let licznik = 0;
  const oczekujace = new Map();

  function doGmaila(wiadomosc) {
    window.parent.postMessage(wiadomosc, GMAIL);
  }

  async function wczytajBaze() {
    try {
      const odp = await fetch(ADRES_BAZY, { cache: "no-cache", credentials: "omit" });
      if (odp.ok) return await odp.json();
    } catch (e) { /* brak połączenia – kopia poniżej */ }
    const kopia = await fetch("odpowiedzi.json");
    return kopia.json();
  }

  const lacznik = {
    wstawSzkic(html) {
      return new Promise((ok, blad) => {
        const id = ++licznik;
        oczekujace.set(id, { ok, blad });
        doGmaila({ typ: "wstaw", id, html });
        setTimeout(() => {
          if (oczekujace.delete(id)) blad({ komunikat: "Gmail nie odpowiedział. Spróbuj ponownie." });
        }, 8000);
      });
    },
  };

  window.addEventListener("message", (e) => {
    if (e.source !== window.parent || e.origin !== GMAIL) return;
    const m = e.data || {};
    if (m.typ === "mail") {
      Panel.czekaj(m.mail.temat);
      Panel.pokaz(m.mail);
    } else if (m.typ === "brak") {
      Panel.brakWiadomosci();
    } else if (m.typ === "motyw") {
      Panel.ustawMotyw(m.motyw);
    } else if (m.typ === "wstawiono") {
      const p = oczekujace.get(m.id);
      if (!p) return;
      oczekujace.delete(m.id);
      if (m.ok) p.ok();
      else p.blad({ komunikat: m.komunikat });
    }
  });

  document.getElementById("zamknij").addEventListener("click", () => doGmaila({ typ: "zamknij" }));

  Panel.uruchom(lacznik, "", wczytajBaze).then((ok) => {
    if (ok) doGmaila({ typ: "gotowy" });
  });
})();
