---
title: Nie pisz w kółko tych samych funkcji, wykorzystaj moc Lodasha
date: 2016-04-16T00:00:00+00:00
description: Odkryj możliwości biblioteki Lodash, aby przerwać monotonię ciągłego pisania tych samych funkcji w JavaScript. Lodash, niskopoziomowa biblioteka, oferuje zwięzłe metody, które znacząco ułatwiają operacje na tablicach, obiektach i łańcuchach znaków. Sprawdź, jak zaoszczędzić czas i uniknąć powielania trywialnego kodu dzięki funkcjom takim jak `_.random`, `_.sample`, `_.times`, `_.difference` czy `_.merge`. Doświadcz korzyści programowania funkcyjnego i zwiększ przejrzystość swojego kodu. Lodash - narzędzie, które sprawi, że pisanie JavaScript stanie się bardziej efektywne i przyjemne.
featuredImg: ./lodash.png
featuredImgAlt: Logo Lodash - Biblioteka narzędziowa dla języka JavaScript, służąca do uproszczenia pracy z danymi i manipulacji nimi
---

Ciągłe pisanie tych samych funkcji jest uciążliwe i frustrujące. Poznaj bibliotekę **[Lodash](https://lodash.com/)** i przestań bezmyślnie powielać trywialny kod.

Lodash jest niskopoziomową biblioteką, która poprzez zwięzłe metody może znacząco ułatwić codzienne życie programistom JavaScript. Operacje na tablicach, obiektach czy łańcuchach znaków stają się przez to o wiele prostsze i znacząco przyspieszają rozwiązywanie problemów.

Lodash został utworzony jako fork projektu **[Underscore](http://underscorejs.org/)**. Tempo rozwoju oraz wprowadzane funkcjonalności przyniosły mu olbrzymią popularność. W przeciwieństwie do większości javascriptowych bibliotek, Lodash unika metod iteracyjnych, na rzecz uproszczonych pętli, co przekłada się na mocno odchudzony kod. Lodash jest lekki. Pełna wersja biblioteki waży _~21 kB_ po minifikacji oraz kompresji _gzip_.

Poniżej przedstawiam 5 metod, dzięki którym zaoszczędziłem czas i przestałem przepisywać funkcje w moich aplikacjach.

## Wybór pseudolosowej liczby z zadanego przedziału

<iframe src="//jsfiddle.net/dawidrylko/vpnsy565/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>

Wybór pseudolosowej liczby za pomocą metody `_.random` jest wskazany, jeżeli szybko chcemy wylosować liczbę z zadanego przedziału i pozostawić sobie furtkę do zmiany tejże metody w przyszłości. Deklarując jeden parametr, funkcja uzna go za wartość maksymalną. Deklarując dwa parametry, funkcja przypisze je kolejno do minimum i maksimum zadanego przedziału. Liczby zmiennoprzecinkowe można uzyskać poprzez dodatkowy parametr - typ boolowski - `true` (brak parametru równoznaczny jest z domyślnym - `false`).

### Pozostałe przypadki użycia funkcji `_.random`

<iframe src="//jsfiddle.net/dawidrylko/jb2u5w6u/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>

## Wybór pseudolosowej pozycji z tablicy

<iframe src="//jsfiddle.net/dawidrylko/8haxhvps/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
 
Oprócz typowej funkcji `_.random`, Lodash oferuje możliwość pobierania przykładowych danych. Metoda `_.sample` jest świetnym sposobem na pobranie pseudolosowego elementu z danego zbioru (`Array | Object`).

## Pętla `for` dla `n` powtórzeń

<iframe src="//jsfiddle.net/dawidrylko/hmdefhnp/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
 
Pętla `for` jest poligonem doświadczalnym dla wszelkich niskopoziomowych bibliotek. Gdy używamy zwykłej pętli `for` w celu iteracji, jesteśmy zmuszeni zadeklarować dodatkową zmienną. Za pomocą Lodasha i metody `_.times` pozbywamy się tej zmory, przez co metoda wydaje się zdecydowanie przyjemniejsza dla oka.

## Różnica pomiędzy dwiema tablicami

<iframe src="//jsfiddle.net/dawidrylko/5ee7mfwL/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
 
Wyraźną różnicę przyjdzie nam zaobserwować, gdy przyjdzie nam użyć metody `_.difference`. Funkcja zwraca wartości z pierwszej tablicy, które nie zostały umieszczone w drugiej tablicy (unikalne względem porównywanej tablicy). Nawet `Array.prototype`, który wykorzystywałem najczęściej wypada blado w porównaniu z dedykowaną metodą Lodasha.

## Łączenie obiektów

<iframe src="//jsfiddle.net/dawidrylko/z6cbLtx0/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
 
Doskonałym pomysłem, gdy chcemy połączyć obiekty, jest użycie metody `_.merge`. Metodę można wykorzystać na wiele sposobów. Dzięki dziedziczeniu właściwości obiektów, operacje na obiektach stają się bardzo proste.
 
<iframe src="//jsfiddle.net/dawidrylko/gbjt5s8x/embedded/js/dark/" width="100%" height="300" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
 
## Lodash - podsumowanie
Lodash jest przydatną biblioteką, która pomaga zaoszczędzić sporo czasu programiście. Zmniejsza ilość napisanych linijek, co przekłada się bezpośrednio na klarowność tego, co napiszemy.

Używam go od niedawna, ale już zauważam różnicę, gdy stosuję go w projektach. Lodash wymusza na mnie programowanie funkcyjne. Pisanie obszernych modułów czy długich metod traci sens. Wzrasta świadomość tego co piszę, jak działają poszczególne metody, a w rezultacie cała aplikacja.

P.S. Na chwilę pisania artykułu JSFiddle ma dostępną tylko jedną wersję biblioteki Lodash (Lo-Dash 2.2.1).
