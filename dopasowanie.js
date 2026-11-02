/*
  Dopasowanie odpowiedzi do treści maila – reguły i słowa kluczowe, bez AI.
  Wszystko liczy się lokalnie, w pamięci przeglądarki. Ten plik nie łączy się z internetem.

  Jak czytać słowa kluczowe w odpowiedzi.json:
    "rozpraw*"      – każde słowo zaczynające się od „rozpraw” (rozprawa, rozprawy, rozprawie…)
    "termin"        – dokładnie to słowo
    "ile kosztuj*"  – fraza: słowa w tej kolejności, z najwyżej 2 innymi słowami pomiędzy
  Polskie znaki i wielkość liter nie mają znaczenia („Sąd” = „sad”).
*/
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Dopasowanie = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MAKS_ODSTEP = 2; // ile słów może stać między kolejnymi słowami frazy

  function bezOgonkow(tekst) {
    return tekst.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  // Linie, od których zaczyna się cytowana wcześniejsza korespondencja.
  const POCZATEK_CYTATU = [
    /^-{2,}\s*(original message|wiadomosc oryginalna|oryginalna wiadomosc)/,
    /^_{5,}/,
    /^(od|from|nadawca|wyslano|sent):\s/,
    /^(w dniu|dnia|on) .*(napisal|napisala|pisze|wrote)/,
  ];
  // Linie, od których zaczyna się podpis lub stopka nadawcy.
  const POCZATEK_STOPKI = [
    /^--\s*$/,
    /^(pozdrawiam|serdecznie pozdrawiam|pozdrowienia|lacze pozdrowienia|z powazaniem|z wyrazami szacunku|best regards|kind regards|regards)\b/,
    /^(wyslane|wyslano) z /,
    /^sent from /,
  ];

  // Zostawia tylko nową treść maila: bez cytatów (>), wcześniejszej korespondencji i stopki.
  function wlasciwaTresc(tekst) {
    const wynik = [];
    for (const linia of String(tekst || "").split(/\r?\n/)) {
      const n = bezOgonkow(linia.trim());
      if (POCZATEK_CYTATU.some((r) => r.test(n)) || POCZATEK_STOPKI.some((r) => r.test(n))) break;
      if (n.startsWith(">")) continue;
      wynik.push(linia);
    }
    const oczyszczona = wynik.join("\n").trim();
    return oczyszczona || String(tekst || "");
  }

  function slowa(tekst) {
    return (tekst.match(/[\p{L}\p{N}]+/gu) || []).map((s) => ({ oryginal: s.toLowerCase(), n: bezOgonkow(s) }));
  }

  function wzorzec(fraza) {
    return bezOgonkow(fraza).split(/\s+/).filter(Boolean)
      .map((cz) => (cz.endsWith("*") ? { prefiks: cz.slice(0, -1) } : { dokladnie: cz }));
  }

  function pasuje(cz, slowo) {
    return cz.prefiks !== undefined ? slowo.startsWith(cz.prefiks) : slowo === cz.dokladnie;
  }

  // Zwraca fragment maila (oryginalne słowa), w którym znaleziono frazę, albo null.
  function znajdz(wz, tokeny) {
    for (let i = 0; i < tokeny.length; i++) {
      if (!pasuje(wz[0], tokeny[i].n)) continue;
      const trafione = [i];
      for (let k = 1; k < wz.length; k++) {
        const od = trafione[trafione.length - 1] + 1;
        const doj = Math.min(od + MAKS_ODSTEP, tokeny.length - 1);
        let j = od;
        while (j <= doj && !pasuje(wz[k], tokeny[j].n)) j++;
        if (j > doj) break;
        trafione.push(j);
      }
      if (trafione.length === wz.length) return trafione.map((t) => tokeny[t].oryginal).join(" ");
    }
    return null;
  }

  // Weekend albo poza 8:00–18:00 (czas komputera prawnika).
  function czyPozaGodzinami(data) {
    const d = data instanceof Date ? data : new Date(data);
    if (isNaN(d)) return false;
    const dzien = d.getDay(), godzina = d.getHours();
    return dzien === 0 || dzien === 6 || godzina < 8 || godzina >= 18;
  }

  function ocen(odpowiedz, tokeny, pozaGodzinami) {
    let punkty = 0;
    const wykryto = [];
    for (const [fraza, waga] of Object.entries(odpowiedz.slowa_kluczowe || {})) {
      const fragment = znajdz(wzorzec(fraza), tokeny);
      if (!fragment) continue;
      punkty += Number(waga) || 0;
      if (waga > 0 && !wykryto.includes(fragment)) wykryto.push(fragment);
    }
    const premia = Number(odpowiedz.premia_poza_godzinami) || 0;
    const kontekst = [];
    if (punkty > 0 && premia && pozaGodzinami) {
      punkty += premia;
      kontekst.push("wysłano poza godzinami pracy");
    }
    return { punkty, wykryto, kontekst };
  }

  /*
    baza  – zawartość odpowiedzi.json
    mail  – { temat, tresc, data }
    Wynik – lista [{ odpowiedz, punkty, wykryto, kontekst }], najlepsze pierwsze; pusta, gdy nic nie pasuje.
  */
  function dopasuj(baza, mail) {
    const { temat = "", tresc = "", data = null } = mail || {};
    const ust = baza.ustawienia || {};
    const prog = ust.prog_trafnosci ?? 4;
    const udzial = ust.minimalny_udzial_najlepszej ?? 0.5;
    const maks = ust.maks_podpowiedzi ?? 3;

    const tokeny = slowa(temat + "\n" + wlasciwaTresc(tresc));
    const poza = data ? czyPozaGodzinami(data) : false;

    const wyniki = baza.odpowiedzi
      .map((o) => Object.assign({ odpowiedz: o }, ocen(o, tokeny, poza)))
      .filter((w) => w.punkty >= prog)
      .sort((a, b) => b.punkty - a.punkty);
    if (!wyniki.length) return [];
    const najlepsza = wyniki[0].punkty;
    return wyniki.filter((w) => w.punkty >= najlepsza * udzial).slice(0, maks);
  }

  return { dopasuj, bezOgonkow, wlasciwaTresc, czyPozaGodzinami };
});
