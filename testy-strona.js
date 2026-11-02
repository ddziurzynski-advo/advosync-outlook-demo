/* Wyświetla wyniki testów na stronie testy.html. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  async function wczytaj(plik) {
    const odp = await fetch(plik, { cache: "no-cache" });
    if (!odp.ok) throw new Error(`Nie znaleziono pliku ${plik}.`);
    const tekst = await odp.text();
    try {
      return JSON.parse(tekst);
    } catch (e) {
      // Wskazujemy linię z błędem, żeby łatwo go znaleźć w edytorze.
      const poz = Number((e.message.match(/position (\d+)/) || [])[1]);
      const linia = isNaN(poz) ? "" : ` (okolice linii ${tekst.slice(0, poz).split("\n").length})`;
      throw new Error(`Błąd w pliku ${plik}${linia}: brakujący przecinek, cudzysłów albo nawias.`);
    }
  }

  function wiersz(w) {
    const li = document.createElement("li");
    li.className = "wynik " + (w.ok ? "wynik-ok" : "wynik-blad");
    const znak = document.createElement("span");
    znak.className = "wynik-znak";
    znak.textContent = w.ok ? "✓" : "✗";
    const tresc = document.createElement("div");
    const nazwa = document.createElement("p");
    nazwa.className = "wynik-nazwa";
    nazwa.textContent = w.nazwa + (w.oczekiwana ? ` · oczekiwana: ${w.oczekiwana}` : "");
    const szcz = document.createElement("p");
    szcz.className = "wynik-szczegoly";
    szcz.textContent = w.szczegoly;
    tresc.append(nazwa, szcz);
    li.append(znak, tresc);
    return li;
  }

  async function start() {
    try {
      const [baza, dane] = await Promise.all([wczytaj("odpowiedzi.json"), wczytaj("testy.json")]);
      const wyniki = Testy.uruchom(baza, dane, Dopasowanie);
      const zle = wyniki.filter((w) => !w.ok).length;
      $("podsumowanie").textContent = zle
        ? `✗ ${zle} z ${wyniki.length} testów nie przechodzi. Szczegóły poniżej.`
        : `✓ Wszystkie testy przechodzą (${wyniki.length}).`;
      $("podsumowanie").classList.add(zle ? "wynik-blad" : "wynik-ok");
      wyniki.sort((a, b) => a.ok - b.ok).forEach((w) => $("wyniki").append(wiersz(w)));
    } catch (e) {
      $("podsumowanie").textContent = "✗ " + e.message;
      $("podsumowanie").classList.add("wynik-blad");
    }
  }

  start();
})();
