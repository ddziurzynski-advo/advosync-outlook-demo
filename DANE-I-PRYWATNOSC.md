# Co dodatek robi z danymi

*Wersja robocza – do sprawdzenia przez prawnika przed publikacją.*

„Szkic odpowiedzi dla kancelarii” podpowiada szkic odpowiedzi na mail od klienta. Działa w dwóch wersjach:
- w **Outlooku** jako dodatek Office,
- w **Gmailu** jako rozszerzenie przeglądarki Chrome.

Korespondencja z klientem jest objęta tajemnicą zawodową. Dlatego w obu wersjach dopasowanie odbywa się wyłącznie na komputerze prawnika, a dodatek nie przekazuje treści maili nikomu.

## Co dodatek widzi

- **Tylko wiadomość otwartą w danej chwili** i tylko wtedy, gdy prawnik sam otworzy panel dodatku.
- Z tej wiadomości korzysta z **tematu, treści i godziny wysłania**. Godzina służy tylko do rozpoznania maili wysłanych wieczorem lub w weekend.
- Nie odczytuje załączników ani adresów nadawcy i odbiorców. Nie korzysta z innych maili, kontaktów ani kalendarza.

**Uprawnienia:**
- **Outlook:** dodatek ma najniższe uprawnienie, jakie Microsoft przewiduje dla takiego dodatku – odczyt otwartej wiadomości. Nie może wysyłać, usuwać ani zmieniać maili.
- **Gmail:** Chrome nie ma uprawnienia „tylko otwarta wiadomość”. Przy rozszerzeniach działających w Gmailu pokazuje ogólny opis „odczytywanie i zmiana danych na mail.google.com”. Kod rozszerzenia odczytuje jednak wyłącznie otwartą wiadomość i tylko przy otwartym panelu. Jedyna zmiana, jaką wprowadza w Gmailu, to wstawienie szkicu do okna odpowiedzi – po kliknięciu „Użyj”. Kod jest publiczny i można to sprawdzić.

## Gdzie odbywa się analiza

- Dopasowanie odpowiedzi odbywa się **na komputerze prawnika** – w oknie Outlooka albo w przeglądarce Chrome. Panel porównuje słowa z maila z listą słów kluczowych.
- Nie korzysta ze sztucznej inteligencji ani z żadnej zewnętrznej usługi.
- Wynik istnieje tylko w otwartym panelu. Po jego zamknięciu znika.

## Czego dodatek nie robi

- **Nie wysyła treści maili** na żaden serwer, do żadnej usługi ani do modelu AI.
- **Nie zapisuje** treści maili: nie używa plików cookie ani pamięci przeglądarki, a w dzienniku przeglądarki (konsoli) nie zostawia treści maili.
- **Nie zbiera statystyk** i nie śledzi użytkowników. Nie ma w nim narzędzi analitycznych.
- **Nie wysyła maili.** Przycisk „Użyj” otwiera odpowiedź ze szkicem, a prawnik sam go poprawia i sam klika „Wyślij”.
- **Nie dopisuje** do maila żadnej stopki, reklamy ani linku.

## Zabezpieczenie techniczne

Panel w obu wersjach ma wbudowaną blokadę przeglądarki (Content Security Policy).
- **Outlook:** panel może się łączyć tylko z serwerem, z którego pochodzą jego pliki, i z serwerem biblioteki Microsoftu.
- **Gmail:** panel może się łączyć tylko z serwerem, z którego pobiera bazę wzorów odpowiedzi.

Próba wysłania danych na jakikolwiek inny adres zostałaby zablokowana przez samą przeglądarkę, nawet gdyby kod zawierał błąd. W Gmailu panel działa w osobnej, odizolowanej ramce rozszerzenia, do której strona Gmaila nie ma dostępu.

## Co warto wiedzieć

- Przy otwarciu panelu pobierane są z serwera (obecnie GitHub Pages) pliki dodatku albo sama baza wzorów odpowiedzi. Dzieje się to tak, jak przy otwieraniu zwykłej strony internetowej. Serwer widzi wtedy standardowe informacje techniczne: adres IP, rodzaj przeglądarki i godzinę. **Nie widzi treści maili.**
- Dodatek do Outlooka korzysta z biblioteki Office.js, którą Outlook pobiera z serwerów Microsoftu, jak każdy dodatek do Outlooka. Same maile i tak znajdują się w usłudze Microsoft 365 lub Google Workspace kancelarii.
- Kod dodatku jest publiczny. Każdy może sprawdzić, że działa tak, jak opisano wyżej.

---

*Przygotowane przez ADVOSYNC. Asystent przygotowuje szkic, a prawnik go sprawdza i sam wysyła. Treści odpowiedzi są szkicami do weryfikacji przez adwokata.*
