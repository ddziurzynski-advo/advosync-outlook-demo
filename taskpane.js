/*
  Panel dodatku ADVOSYNC.
  Zasada: treść maila jest czytana tylko w pamięci tego panelu.
  Nigdzie jej nie wysyłamy, nie zapisujemy i nie wypisujemy do konsoli.
*/
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function pokazTemat() {
    const item = Office.context.mailbox.item;
    if (!item) {
      $("temat").textContent = "Otwórz wiadomość, aby zobaczyć podpowiedzi.";
      return;
    }
    $("temat").textContent = item.subject || "(bez tematu)";
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

  if (typeof Office === "undefined") {
    $("temat").textContent = "Nie udało się wczytać biblioteki Office.js. Sprawdź połączenie z internetem.";
    return;
  }

  Office.onReady((info) => {
    if (info.host !== Office.HostType.Outlook) {
      $("temat").textContent = "Ten panel działa wewnątrz Outlooka.";
      return;
    }
    ustawMotyw();
    pokazTemat();

    // Przypięty panel: odśwież, gdy prawnik otworzy inny mail.
    if (Office.context.requirements.isSetSupported("Mailbox", "1.5")) {
      Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, pokazTemat);
    }
  });
})();
