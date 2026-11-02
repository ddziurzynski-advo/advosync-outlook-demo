# Co dodatek robi z danymi

*Wersja robocza – do sprawdzenia przez prawnika przed publikacją.*

Dodatek ADVOSYNC do Outlooka podpowiada szkic odpowiedzi na mail od klienta. Korespondencja z klientem jest objęta tajemnicą zawodową. Dlatego dodatek działa wyłącznie w Outlooku prawnika i nie przekazuje treści maili nikomu.

## Co dodatek widzi

- **Tylko wiadomość otwartą w danej chwili** i tylko wtedy, gdy prawnik sam otworzy panel dodatku.
- Z tej wiadomości korzysta z **tematu, treści i godziny wysłania**. Godzina służy tylko do rozpoznania maili wysłanych wieczorem lub w weekend.
- Nie odczytuje załączników ani adresów nadawcy i odbiorców. Nie ma dostępu do innych maili, kontaktów ani kalendarza.
- Dodatek ma najniższe uprawnienie, jakie Microsoft przewiduje dla takiego dodatku: odczyt otwartej wiadomości. Nie może wysyłać, usuwać ani zmieniać maili.

## Gdzie odbywa się analiza

- Dopasowanie odpowiedzi odbywa się **na komputerze prawnika, w oknie Outlooka**. Panel porównuje słowa z maila z listą słów kluczowych.
- Nie korzysta ze sztucznej inteligencji ani z żadnej zewnętrznej usługi.
- Wynik istnieje tylko w otwartym panelu. Po jego zamknięciu znika.

## Czego dodatek nie robi

- **Nie wysyła treści maili** na żaden serwer, do żadnej usługi ani do modelu AI.
- **Nie zapisuje** treści maili: nie używa plików cookie ani pamięci przeglądarki, a w dzienniku przeglądarki (konsoli) nie zostawia treści maili.
- **Nie zbiera statystyk** i nie śledzi użytkowników. Nie ma w nim narzędzi analitycznych.
- **Nie wysyła maili.** Przycisk „Użyj” otwiera okno odpowiedzi ze szkicem, a prawnik sam go poprawia i sam klika „Wyślij”.
- **Nie dopisuje** do maila żadnej stopki, reklamy ani linku.

## Zabezpieczenie techniczne

Panel ma wbudowaną blokadę przeglądarki (Content Security Policy): może łączyć się tylko z serwerem, z którego pochodzą jego pliki, i z serwerem biblioteki Microsoftu. Próba wysłania danych na jakikolwiek inny adres zostałaby zablokowana przez samą przeglądarkę, nawet gdyby kod zawierał błąd.

## Co warto wiedzieć

- Przy otwarciu panelu Outlook pobiera pliki dodatku z serwera (obecnie GitHub Pages), tak jak przy otwieraniu zwykłej strony internetowej. Serwer widzi wtedy standardowe informacje techniczne: adres IP, rodzaj przeglądarki i godzinę. **Nie widzi treści maili.**
- Każdy dodatek do Outlooka korzysta z biblioteki Office.js, którą Outlook pobiera z serwerów Microsoftu. Same maile i tak znajdują się w usłudze Microsoft 365 kancelarii.
- Kod dodatku jest publiczny. Każdy może sprawdzić, że działa tak, jak opisano wyżej.

---

*To demo pokazuje pomysł ADVOSYNC: asystent przygotowuje szkic, a prawnik go sprawdza i sam wysyła. Treści odpowiedzi są szkicami do weryfikacji przez adwokata.*
