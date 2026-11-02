# Szkic odpowiedzi dla kancelarii (dodatek ADVOSYNC do Outlooka i Gmaila)

Demo pomysłu ADVOSYNC: asystent przygotowuje szkic odpowiedzi na mail od klienta, a prawnik go sprawdza i sam wysyła.

Działa w Outlooku (dodatek Office) i w Gmailu (rozszerzenie Chrome) – z tą samą bazą odpowiedzi i tym samym panelem.

Prawnik otwiera mail i klika przycisk **Szkic odpowiedzi**. W panelu bocznym widzi 1–3 pasujące odpowiedzi z bazy 20 gotowych tekstów, z informacją, co zostało wykryte. Po kliknięciu **Użyj** otwiera się odpowiedź ze szkicem, w którym pola do uzupełnienia mają żółte tło. Dodatek nigdy niczego nie wysyła sam.

To demo do nagrań i rozmów z prawnikami, a nie gotowy produkt. Wszystkie teksty mają status „szkic – do weryfikacji przez adwokata”.

- **Strona instalacji (do wysyłania prawnikom):** https://ddziurzynski-advo.github.io/advosync-outlook-demo/ (bezpośrednio do Gmaila: …/#gmail)
- **Testy dopasowania:** https://ddziurzynski-advo.github.io/advosync-outlook-demo/testy.html
- **Co dodatek robi z danymi:** [DANE-I-PRYWATNOSC.md](DANE-I-PRYWATNOSC.md)
- **Maile do nagrań:** [MAILE-DO-NAGRAN.md](MAILE-DO-NAGRAN.md)

---

## Co jest w folderze

| Plik | Do czego służy | Czy go edytujesz? |
|---|---|---|
| `odpowiedzi.json` | 20 odpowiedzi: treść, słowa kluczowe, wagi, status | **Tak**, to główny plik do edycji |
| `testy.json` | fikcyjne maile i oczekiwana odpowiedź dla każdego | Tak, gdy dodajesz testy |
| `MAILE-DO-NAGRAN.md` | 10 maili do nagrania demo | Nie, powstaje z `testy.json` |
| `manifest.xml` | „wizytówka” dodatku dla Outlooka: nazwa, adres, uprawnienia | Tylko przy zmianie adresu (patrz niżej) |
| `panel.js`, `taskpane.css` | wspólny panel boczny (Outlook i Gmail) | Nie |
| `taskpane.html`, `taskpane.js` | panel w Outlooku (łącznik z Outlookiem) | Nie |
| `gmail/szkic-odpowiedzi-gmail.zip` | rozszerzenie Chrome dla Gmaila – plik do pobrania | Nie, powstaje automatycznie (patrz „Aktualizacja”) |
| `gmail/zrodlo/` | pliki rozszerzenia dla Gmaila (łącznik z Gmailem, manifest rozszerzenia) | Nie |
| `gmail/zbuduj.js` | skrypt, który składa plik ZIP rozszerzenia | Nie |
| `dopasowanie.js` | reguły dopasowania | Nie |
| `testy.html`, `testy.js`, `testy-strona.js` | strona z testami | Nie |
| `fonts/`, `assets/` | fonty marki i ikony | Nie |
| `index.html`, `strona.css`, `strona.js` | strona instalacji dla prawników (adres główny dodatku) | Tak, gdy zmieniasz teksty na stronie |
| `assets/panel-przyklad.png` | zrzut panelu z fikcyjnym mailem, pokazywany na stronie instalacji | Możesz podmienić na własny zrzut |

---

## 1. Instalacja

Dodatek składa się z dwóch części:
- pliki na GitHub Pages (już tam są),
- manifest wgrany do Outlooka (robi to każda osoba, która chce używać dodatku).

### Instalacja w Outlooku (dla każdej osoby z zespołu)

1. Pobierz plik `manifest.xml` z repozytorium: otwórz go na GitHubie i kliknij ikonę pobierania (**Download raw file**) w prawym górnym rogu podglądu pliku.
2. W przeglądarce wejdź na **https://aka.ms/olksideload** i zaloguj się kontem Microsoft 365. Po kilku sekundach otworzy się okno **Add-Ins for Outlook** („Dodatki dla programu Outlook”).
3. Kliknij **My add-ins** („Moje dodatki”).
4. Przewiń na dół do sekcji **Custom Addins** („Dodatki niestandardowe”).
5. Kliknij **Add a custom add-in**, potem **Add from File**, i wybierz `manifest.xml`.
6. Potwierdź ostrzeżenie przyciskiem **Install**. Ostrzeżenie pojawia się, bo dodatek nie pochodzi ze sklepu Microsoftu.
7. Otwórz dowolny mail. Na pasku nad mailem kliknij **Apps** („Aplikacje”) albo **…**, a potem **Szkic odpowiedzi dla kancelarii**.

Dodatek pojawi się też w nowym Outlooku dla Windows i w Outlooku na Macu. W klasycznym Outlooku dla Windows może to potrwać do 24 godzin.

**Jeśli w kroku 4 nie ma sekcji „Custom Addins”**, administrator Microsoft 365 blokuje własne dodatki. Trzeba go poprosić o włączenie roli „My Custom Apps” albo użyć prywatnego konta outlook.com.


### Instalacja w Gmailu (rozszerzenie Chrome)

Do czasu publikacji w Chrome Web Store rozszerzenie instaluje się z pliku:

1. Na stronie instalacji wybierz zakładkę **Gmail** i kliknij **Pobierz dla Gmaila**.
2. Rozpakuj plik ZIP. Na Macu wystarczy dwuklik, w Windows: prawy przycisk → **Wyodrębnij wszystkie**. Folder przenieś w stałe miejsce (np. Dokumenty) i go nie usuwaj.
3. W Chrome wpisz w pasku adresu `chrome://extensions` (w Edge: `edge://extensions`).
4. Włącz **Tryb dewelopera** (Developer mode).
5. Kliknij **Załaduj rozpakowane** (Load unpacked) i wskaż rozpakowany folder.
6. Odśwież Gmaila i otwórz mail. W prawym dolnym rogu pojawi się przycisk **Szkic odpowiedzi**.

Działa w Chrome i Edge na komputerze. Nie działa w aplikacji Gmail na telefonie ani w Safari czy Firefoksie.

### Odinstalowanie

**Outlook:** wykonaj kroki 2–4 instalacji. Przy dodatku kliknij **…**, a potem **Remove**.

**Gmail:** na `chrome://extensions` przy rozszerzeniu kliknij **Usuń** (Remove), a potem skasuj folder.

### Hosting od zera (gdyby trzeba było go postawić jeszcze raz)

1. Na github.com utwórz publiczne repozytorium, np. `advosync-outlook-demo`.
2. Kliknij **uploading an existing file** i przeciągnij całą zawartość folderu.
3. Wejdź w **Settings**, potem **Pages**, wybierz Branch **main** i folder **/(root)**, kliknij **Save**.
4. Po 1–2 minutach strona działa pod adresem `https://LOGIN.github.io/NAZWA-REPOZYTORIUM/`.
5. W `manifest.xml` zamień wszystkie wystąpienia starego adresu na nowy (patrz „Zmiana adresu” niżej).

---

## 2. Edycja odpowiedzi

Wszystkie teksty i słowa kluczowe są w pliku **`odpowiedzi.json`**. Najprościej edytować go bezpośrednio na GitHubie:

1. Otwórz repozytorium na GitHubie i kliknij plik `odpowiedzi.json`.
2. Kliknij ikonę ołówka (**Edit this file**) w prawym górnym rogu.
3. Wprowadź zmiany.
4. Kliknij **Commit changes…**, a potem znowu **Commit changes**.
5. Odczekaj 2–3 minuty i otwórz **testy.html**. U góry powinno być „✓ Wszystkie testy przechodzą”.
6. W Outlooku odśwież stronę (Cmd+R lub F5) i otwórz panel ponownie.

### Jak wygląda jedna odpowiedź

```json
{
  "numer": "03",
  "grupa": "Stan sprawy i terminy",
  "tytul": "Kiedy będzie termin rozprawy?",
  "sytuacja": "Klient pyta o termin rozprawy, a sąd jeszcze go nie wyznaczył.",
  "tresc": [
    "Dzień dobry,",
    "sąd nie wyznaczył jeszcze terminu rozprawy. …",
    "Z poważaniem"
  ],
  "slowa_kluczowe": {
    "termin*": 2,
    "rozpraw*": 3,
    "kiedy": 1
  },
  "status": "szkic – do weryfikacji przez adwokata"
}
```

- **`tresc`**: każda linijka w cudzysłowie to osobny akapit maila. Między akapitami stawiaj przecinek.
- **Pola do uzupełnienia** pisz w nawiasach kwadratowych, np. `[sygnatura akt]`, `[kwota]`, `[data]`. W Outlooku dostaną żółte tło.
- **`grupa`** musi mieć dokładnie taką nazwę jak na liście `grupy` na górze pliku.

### Słowa kluczowe i wagi

Każde słowo kluczowe ma wagę, czyli liczbę punktów. Panel sumuje punkty za słowa znalezione w temacie i treści maila. Pokazuje odpowiedzi, które mają co najmniej **4 punkty** (`prog_trafnosci`), najwyżej 3 naraz.

| Zapis | Co znaczy | Przykład dopasowania |
|---|---|---|
| `"rozpraw*": 3` | gwiazdka = dowolna końcówka | rozprawa, rozprawy, rozprawie |
| `"kiedy": 1` | dokładnie to słowo | kiedy |
| `"ile kosztuj*": 5` | fraza: słowa w tej kolejności, najwyżej 2 inne słowa pomiędzy | „ile to kosztuje”, „ile kosztuje” |
| `"podzieko*": -3` | waga ujemna obniża wynik | np. gdy klient tylko dziękuje |

- Wielkie litery i polskie znaki nie mają znaczenia: `sad*` złapie też „Sąd” i „sądu”. Słowa kluczowe najlepiej pisać bez polskich znaków.
- Wagi 4–6 dawaj słowom, które prawie na pewno wskazują tę odpowiedź (np. `pelnomocnict*`). Wagi 1–2 dawaj słowom pomocniczym (np. `kiedy`).
- Dodatek pomija cytowaną wcześniejszą korespondencję (od linii „Od:”, „From:”, „W dniu … napisał”) i stopkę (od „Pozdrawiam”, „Z poważaniem”).
- Odpowiedzi 09 i 10 mają `premia_poza_godzinami`: dodatkowe punkty, gdy mail przyszedł w weekend albo poza 8:00–18:00. Liczą się tylko wtedy, gdy znaleziono też jakieś słowo kluczowe.

### Najczęstsze błędy w pliku

- **Brak przecinka** między elementami listy albo między słowami kluczowymi. Po ostatnim elemencie przecinka **nie** stawiamy.
- **Cudzysłów prosty `"` wewnątrz tekstu** psuje plik. W treści używaj polskich cudzysłowów „…”.
- Jeśli plik jest uszkodzony, strona `testy.html` pokaże okolice linii z błędem, a panel napisze, że nie może wczytać bazy.

### Dodanie testu

W `testy.json` skopiuj jeden z przypadków (np. `T01`), zmień `id`, `temat`, `tresc` i `oczekiwana` (numer odpowiedzi, która ma być pierwsza, albo `null`, jeśli nic nie powinno pasować). Testy pomagają sprawdzić, czy zmiana słów kluczowych niczego nie zepsuła.

---

## 3. Aktualizacja dodatku

- **Zmiana treści lub słów kluczowych:** edytujesz `odpowiedzi.json` na GitHubie (patrz wyżej). Nie trzeba niczego instalować ponownie – ani w Outlooku, ani w Gmailu. Rozszerzenie dla Gmaila pobiera bazę z tego samego adresu; kopię w pliku ZIP wykorzystuje tylko wtedy, gdy serwer jest niedostępny.
- **Nowa wersja panelu** (pliki od zespołu albo od Claude):
  1. W repozytorium kliknij **Add file**, potem **Upload files**.
  2. Przeciągnij nowe pliki. Pliki o tych samych nazwach zostaną zastąpione.
  3. Kliknij **Commit changes**.
  4. Po 2–3 minutach odśwież Outlooka.
- **Zmiana adresu**, np. przeniesienie na advosync.com:
  1. Wgraj wszystkie pliki na nowy serwer. Musi działać przez https.
  2. W `manifest.xml` zamień `https://ddziurzynski-advo.github.io/advosync-outlook-demo` na nowy adres (12 miejsc).
  3. Podnieś numer w `<Version>`, np. z `1.0.0.0` na `1.0.1.0`.
  4. Każda osoba usuwa stary dodatek i instaluje nowy manifest.
  5. Dla Gmaila zmień ten sam adres w `gmail/zrodlo/gmail-panel.js` (`ADRES_BAZY`) i w `gmail/zrodlo/manifest.json` (`connect-src`), a potem złóż nowy ZIP (niżej).
- **Nowa wersja rozszerzenia dla Gmaila** (gdy zmienia się panel albo Gmail zmieni wygląd):
  1. Podnieś `version` w `gmail/zrodlo/manifest.json`, np. z `1.0.0` na `1.0.1`.
  2. W folderze `gmail` uruchom `node zbuduj.js` (to zadanie dla osoby technicznej albo dla Claude). Powstanie nowy `gmail/szkic-odpowiedzi-gmail.zip` ze wspólnymi plikami panelu.
  3. Wgraj ZIP na GitHuba.
  4. Każda osoba pobiera nowy ZIP, podmienia zawartość swojego folderu i na `chrome://extensions` klika ikonę odświeżenia przy rozszerzeniu.

GitHub Pages przechowuje pliki w pamięci podręcznej do 10 minut. Jeśli zmiana nie jest widoczna, odczekaj chwilę i odśwież Outlooka.

---

## 4. Rozwiązywanie problemów

| Objaw | Co zrobić |
|---|---|
| Outlook: nie ma przycisku dodatku | Sprawdź, czy otwarty jest odebrany mail, a nie szkic. Poszukaj pod **Apps** albo **…**. W klasycznym Outlooku odczekaj do 24 h. |
| Panel pokazuje „Nie udało się wczytać bazy odpowiedzi” | Otwórz `testy.html`, tam zobaczysz błąd w `odpowiedzi.json`. |
| Nic nie pasuje, choć powinno | Dopisz słowo kluczowe albo podnieś jego wagę. Dodaj test z tym mailem. |
| Pasuje zła odpowiedź | Obniż wagę słowa, które ją wywołuje, albo dodaj mu wagę ujemną. Sprawdź testy. |
| Gmail: nie ma przycisku „Szkic odpowiedzi” | Przycisk jest tylko przy otwartej wiadomości. Odśwież Gmaila; sprawdź na `chrome://extensions`, czy rozszerzenie jest włączone, a jego folder istnieje. |
| Gmail: „Użyj” pokazuje komunikat o przycisku „Odpowiedz” | Kliknij **Odpowiedz** w Gmailu i ponownie **Użyj**. Jeśli problem wraca u wszystkich, Gmail zmienił wygląd – rozszerzenie wymaga aktualizacji (selektory opisane na początku `gmail/zrodlo/content.js`). |
| Żółte tło zostaje na wpisanym tekście | Tak działa edytor Outlooka. Przed wysłaniem zaznacz tekst i ustaw zakreślenie na **No color** („Brak koloru”). |

---

## 5. Co byłoby potrzebne, żeby dać dodatek prawnikom spoza zespołu

Szczegółowa lista dla Microsoft Marketplace jest w osobnym folderze `publikacja-marketplace` (poza repozytorium). Dla Gmaila dochodzi **publikacja w Chrome Web Store**: konto dewelopera Google (jednorazowa opłata), opis i zrzuty, polityka prywatności obejmująca rozszerzenie, uzasadnienie uprawnienia do mail.google.com i weryfikacja przez Google. Można wybrać publikację „niepubliczną” – rozszerzenie instaluje się jednym kliknięciem z linku, ale nie widać go w wyszukiwarce sklepu.

1. **Własny hosting na domenie ADVOSYNC** (np. `outlook.advosync.com`) zamiast prywatnego konta GitHub, z https i kontrolą firmy nad plikami.
2. **Polityka prywatności i regulamin** pod stałymi adresami, podlinkowane w manifeście. Do tego ocena, przez prawnika, czy ADVOSYNC w ogóle przetwarza dane osobowe (dodatek nie przesyła treści maili, ale serwer widzi adresy IP).
3. **Wybór sposobu wdrożenia:**
   - wdrożenie przez administratora Microsoft 365 kancelarii (Microsoft 365 admin center → Integrated apps → Upload custom apps): bez sklepu, administrator instaluje dodatek dla wybranych osób;
   - albo publikacja w Microsoft Marketplace: konto w Partner Center, walidacja przez Microsoft, wymagania techniczne i treściowe.
4. **Dopracowany manifest:** stały identyfikator, numeracja wersji, adres wsparcia, ewentualnie wersja mobilna (obecnie dodatek nie działa w Outlooku na telefonie) i rozważenie nowego formatu manifestu (JSON).
5. **Treści sprawdzone przez adwokata lub radcę prawnego** i jasne oznaczenie, że to szkice do weryfikacji.
6. **Testy na wszystkich wersjach Outlooka**, z których korzystają kancelarie: przeglądarka, nowy i klasyczny Outlook dla Windows, Mac. Do tego sprawdzenie dostępności, np. obsługi z klawiatury.
