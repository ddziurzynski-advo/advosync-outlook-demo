/*
  Łącznik panelu z Outlookiem (Office.js). Wygląd i logika panelu są w panel.js.
  Zasada: treść maila jest czytana tylko w pamięci tego panelu.
  Nigdzie jej nie wysyłamy, nie zapisujemy i nie wypisujemy do konsoli.
*/
(function () {
  "use strict";

  let biezacyOdczyt = 0; // chroni przed spóźnionym wynikiem, gdy prawnik szybko przełącza maile

  function analizuj() {
    const item = Office.context.mailbox.item;
    const nr = ++biezacyOdczyt;
    if (!item) {
      Panel.brakWiadomosci();
      return;
    }
    const temat = item.subject || "";
    Panel.czekaj(temat);
    item.body.getAsync(Office.CoercionType.Text, (wynik) => {
      if (nr !== biezacyOdczyt) return;
      if (wynik.status !== Office.AsyncResultStatus.Succeeded) {
        Panel.bladOdczytu();
        return;
      }
      Panel.pokaz({ temat, tresc: wynik.value, data: item.dateTimeCreated });
    });
  }

  // Motyw: bierzemy kolor tła z Outlooka; jeśli Outlook go nie podaje, decyduje ustawienie systemu (CSS).
  function ustawMotyw(zdarzenie) {
    const motyw = (zdarzenie && zdarzenie.officeTheme) || Office.context.officeTheme;
    if (!motyw || !motyw.bodyBackgroundColor) return;
    const hex = motyw.bodyBackgroundColor.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.substr(i, 2), 16));
    const jasnosc = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    Panel.ustawMotyw(jasnosc < 0.5 ? "dark" : "light");
  }

  // Otwiera odpowiedź do nadawcy ze szkicem. Niczego nie wysyła.
  const lacznik = {
    wstawSzkic(html) {
      Office.context.mailbox.item.displayReplyForm({ htmlBody: html });
    },
  };

  async function start(wOutlooku) {
    const ok = await Panel.uruchom(wOutlooku ? lacznik : null, "Ten panel działa wewnątrz Outlooka. Poniżej podgląd bazy odpowiedzi.");
    if (!ok || !wOutlooku) return;
    ustawMotyw();
    analizuj();
    // Przypięty panel: odśwież, gdy prawnik otworzy inny mail.
    if (Office.context.requirements.isSetSupported("Mailbox", "1.5")) {
      Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, analizuj);
    }
    // Zmiana motywu Outlooka przy otwartym panelu (nie każdy Outlook to obsługuje).
    if (Office.EventType.OfficeThemeChanged) {
      try {
        Office.context.mailbox.addHandlerAsync(Office.EventType.OfficeThemeChanged, ustawMotyw);
      } catch (e) { /* brak obsługi – motyw ustawi się przy kolejnym otwarciu panelu */ }
    }
  }

  if (typeof Office === "undefined") {
    start(false);
    return;
  }
  Office.onReady((info) => start(info.host === Office.HostType.Outlook));
})();
