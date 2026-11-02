/*
  Testy bazy odpowiedzi i dopasowania. Używa ich strona testy.html.
  Każdy wynik: { nazwa, ok, szczegoly }.
*/
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Testy = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const POLA = ["numer", "grupa", "tytul", "sytuacja", "tresc", "slowa_kluczowe", "status"];

  function sprawdzBaze(baza) {
    const wyniki = [];
    const bledy = [];
    const odp = baza.odpowiedzi || [];
    const grupy = baza.grupy || [];
    const numery = new Set();

    if (odp.length !== 20) bledy.push(`jest ${odp.length} odpowiedzi zamiast 20`);
    for (const o of odp) {
      const kto = `odpowiedź ${o.numer || "(bez numeru)"}`;
      for (const p of POLA) if (o[p] === undefined || o[p] === "") bledy.push(`${kto}: brak pola „${p}”`);
      if (numery.has(o.numer)) bledy.push(`${kto}: numer się powtarza`);
      numery.add(o.numer);
      if (o.grupa && !grupy.includes(o.grupa)) bledy.push(`${kto}: grupa „${o.grupa}” nie jest na liście grup`);
      if (!Array.isArray(o.tresc) || !o.tresc.length) bledy.push(`${kto}: „tresc” musi być listą akapitów`);
      else {
        const t = o.tresc.join(" ");
        if ((t.match(/\[/g) || []).length !== (t.match(/\]/g) || []).length) bledy.push(`${kto}: niedomknięty nawias [ ] w treści`);
      }
      for (const [fraza, waga] of Object.entries(o.slowa_kluczowe || {})) {
        if (typeof waga !== "number") bledy.push(`${kto}: waga słowa „${fraza}” musi być liczbą`);
      }
    }
    for (const g of grupy) {
      const ile = odp.filter((o) => o.grupa === g).length;
      if (ile !== 4) bledy.push(`grupa „${g}” ma ${ile} odpowiedzi zamiast 4`);
    }
    wyniki.push({ nazwa: "Plik odpowiedzi.json jest kompletny", ok: !bledy.length, szczegoly: bledy.join("; ") || "20 odpowiedzi, 5 grup po 4, wszystkie pola uzupełnione" });
    return wyniki;
  }

  function sprawdzPrzypadki(baza, przypadki, Dopasowanie) {
    const wyniki = [];
    for (const p of przypadki) {
      const lista = Dopasowanie.dopasuj(baza, { temat: p.temat, tresc: p.tresc.join("\n"), data: p.data || null });
      const numery = lista.map((w) => w.odpowiedz.numer);
      const opis = numery.length ? lista.map((w) => `${w.odpowiedz.numer} (${w.punkty} pkt)`).join(", ") : "brak podpowiedzi";
      const problemy = [];
      if (p.oczekiwana === null && numery.length) problemy.push("miało nie być podpowiedzi");
      if (p.oczekiwana !== null && numery[0] !== p.oczekiwana) problemy.push(`pierwsza powinna być ${p.oczekiwana}`);
      for (const n of p.nie_powinno_byc || []) if (numery.includes(n)) problemy.push(`nie powinno być ${n}`);
      wyniki.push({
        nazwa: `${p.id} · ${p.temat}`,
        ok: !problemy.length,
        oczekiwana: p.oczekiwana === null ? "brak" : p.oczekiwana,
        szczegoly: `wynik: ${opis}` + (problemy.length ? ` → ${problemy.join("; ")}` : ""),
      });
    }
    const pokryte = new Set(przypadki.map((p) => p.oczekiwana));
    const bez = (baza.odpowiedzi || []).map((o) => o.numer).filter((n) => !pokryte.has(n));
    wyniki.push({ nazwa: "Każda odpowiedź ma co najmniej jeden test", ok: !bez.length, szczegoly: bez.length ? `bez testu: ${bez.join(", ")}` : "wszystkie 20 odpowiedzi mają test" });

    // Drobne testy przygotowania tekstu.
    const norm = Dopasowanie.bezOgonkow("Sąd Łódź ŻÓŁĆ");
    wyniki.push({ nazwa: "Usuwanie polskich znaków", ok: norm === "sad lodz zolc", szczegoly: `„Sąd Łódź ŻÓŁĆ” → „${norm}”` });
    const cyt = Dopasowanie.wlasciwaTresc("Nowe pytanie\n> stary cytat\nPozdrawiam\nJan");
    wyniki.push({ nazwa: "Pomijanie cytatów i stopki", ok: cyt === "Nowe pytanie", szczegoly: `zostało: „${cyt}”` });
    return wyniki;
  }

  function uruchom(baza, dane, Dopasowanie) {
    return sprawdzBaze(baza).concat(sprawdzPrzypadki(baza, dane.przypadki, Dopasowanie));
  }

  return { uruchom };
});
