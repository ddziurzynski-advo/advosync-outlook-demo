/* Strona instalacji: przełączanie zakładek Outlook / Gmail. Bez JavaScriptu widać obie instrukcje. */
(function () {
  "use strict";

  const karty = [...document.querySelectorAll('[role="tab"]')];

  function pokaz(nazwa, fokus) {
    for (const k of karty) {
      const wybrana = k.dataset.karta === nazwa;
      k.setAttribute("aria-selected", String(wybrana));
      k.tabIndex = wybrana ? 0 : -1;
      document.getElementById(k.getAttribute("aria-controls")).hidden = !wybrana;
      if (wybrana && fokus) k.focus();
    }
  }

  karty.forEach((k, i) => {
    k.addEventListener("click", () => {
      pokaz(k.dataset.karta);
      history.replaceState(null, "", "#" + k.dataset.karta);
    });
    k.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const nastepna = karty[(i + (e.key === "ArrowRight" ? 1 : karty.length - 1)) % karty.length];
      pokaz(nastepna.dataset.karta, true);
    });
  });

  // Przyciski w nagłówku od razu wybierają właściwą zakładkę.
  document.querySelectorAll("[data-pokaz]").forEach((a) => {
    a.addEventListener("click", () => pokaz(a.dataset.pokaz));
  });

  // Link bezpośredni, np. …/#gmail
  const start = location.hash.slice(1);
  if (start === "gmail" || start === "outlook") {
    pokaz(start);
    document.getElementById("instalacja").scrollIntoView();
  } else {
    pokaz("outlook");
  }
})();
