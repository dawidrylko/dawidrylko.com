---
title: Nie pisz w kółko tych samych funkcji, wykorzystaj moc Lodasha
date: 2016-04-16T13:31:30.000Z
description: Odkryj możliwości biblioteki Lodash, aby przerwać monotonię ciągłego pisania tych samych funkcji w JavaScript. Lodash, niskopoziomowa biblioteka, oferuje zwięzłe metody, które znacząco ułatwiają operacje na tablicach, obiektach i łańcuchach znaków. Sprawdź, jak zaoszczędzić czas i uniknąć powielania trywialnego kodu dzięki funkcjom takim jak `_.random`, `_.sample`, `_.times`, `_.difference` czy `_.merge`. Doświadcz korzyści programowania funkcyjnego i zwiększ przejrzystość swojego kodu. Lodash - narzędzie, które sprawi, że pisanie JavaScript stanie się bardziej efektywne i przyjemne.
featuredImg: ./lodash.png
featuredImgAlt: Logo Lodash - Biblioteka narzędziowa dla języka JavaScript, służąca do uproszczenia pracy z danymi i manipulacji nimi.
tags: ['javascript']
---

Ciągłe pisanie tych samych funkcji jest uciążliwe i frustrujące. Poznaj bibliotekę **[Lodash](https://lodash.com/)** i przestań bezmyślnie powielać trywialny kod.

Lodash jest niskopoziomową biblioteką, która poprzez zwięzłe metody może znacząco ułatwić codzienne życie programistom JavaScript. Operacje na tablicach, obiektach czy łańcuchach znaków stają się przez to o wiele prostsze i znacząco przyspieszają rozwiązywanie problemów.

Lodash został utworzony jako fork projektu **[Underscore](http://underscorejs.org/)**. Tempo rozwoju oraz wprowadzane funkcjonalności przyniosły mu olbrzymią popularność. W przeciwieństwie do większości javascriptowych bibliotek, Lodash unika metod iteracyjnych, na rzecz uproszczonych pętli, co przekłada się na mocno odchudzony kod. Lodash jest lekki. Pełna wersja biblioteki waży _~21 kB_ po minifikacji oraz kompresji _gzip_.

Poniżej przedstawiam 5 metod, dzięki którym zaoszczędziłem czas i przestałem przepisywać funkcje w moich aplikacjach.

## Wybór pseudolosowej liczby z zadanego przedziału

```javascript
// Get random number from 31 to 49 [Lodash]

// Utility method
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var pureJS = getRandomNumber(31, 49);

// Lodash
var lodash = _.random(31, 49);

console.log(pureJS); // 34
console.log(lodash); // 32
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/vpnsy565) 🚀

Wybór pseudolosowej liczby za pomocą metody `_.random` jest wskazany, jeżeli szybko chcemy wylosować liczbę z zadanego przedziału i pozostawić sobie furtkę do zmiany tejże metody w przyszłości. Deklarując jeden parametr, funkcja uzna go za wartość maksymalną. Deklarując dwa parametry, funkcja przypisze je kolejno do minimum i maksimum zadanego przedziału. Liczby zmiennoprzecinkowe można uzyskać poprzez dodatkowy parametr - typ boolowski - `true` (brak parametru równoznaczny jest z domyślnym - `false`).

### Pozostałe przypadki użycia funkcji `_.random`

```javascript
// Additional options for _.random [Lodash]
_.random(0, 10); // Return integer from 0 to 10
_.random(10); // Return integer from 0 to 10
_.random(10, true); // Return floating point from 0 to 10
_.random(1.1, 9.9); // Return floating point from 1.1 to 9.9
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/jb2u5w6u) 🚀

## Wybór pseudolosowej pozycji z tablicy

```javascript
// Get random item from an array [Lodash]

// Array of names for drawing
var names = ['Maria', 'Antoni', 'Lucyna', 'Ryszard', 'Ewa', 'Leszek'];

// Simple random function
function getRandomName(names) {
  return names[Math.floor(Math.random() * names.length)];
}

var pureJS = getRandomName(names);

// Lodash
var lodash = _.sample(names);

console.log(pureJS); // Ewa
console.log(lodash); // Lucyna
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/8haxhvps) 🚀

Oprócz typowej funkcji `_.random`, Lodash oferuje możliwość pobierania przykładowych danych. Metoda `_.sample` jest świetnym sposobem na pobranie pseudolosowego elementu z danego zbioru (`Array | Object`).

## Pętla `for` dla `n` powtórzeń

```javascript
// Loop for n times [Lodash]

// Basic for loop
for (var i = 0; i < 10; i++) {
  // TODO
}

// Lodash
_.times(10, function () {
  // TODO
});
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/hmdefhnp) 🚀

Pętla `for` jest poligonem doświadczalnym dla wszelkich niskopoziomowych bibliotek. Gdy używamy zwykłej pętli `for` w celu iteracji, jesteśmy zmuszeni zadeklarować dodatkową zmienną. Za pomocą Lodasha i metody `_.times` pozbywamy się tej zmory, przez co metoda wydaje się zdecydowanie przyjemniejsza dla oka.

## Różnica pomiędzy dwiema tablicami

```javascript
// Difference between two arrays [Lodash]

var array1 = [1, 2, 3, 4, 5];
var array2 = [2, 4, 5];

// JS difference function
function difference(test1, test2) {
  var helpArray = [];
  var difference = [];

  for (var i = 0; i < test1.length; i++) {
    helpArray[test1[i]] = true;
  }

  for (var j = 0; j < test2.length; j++) {
    if (helpArray[test2[j]]) {
      delete helpArray[test2[j]];
    } else {
      helpArray[test2[j]] = true;
    }
  }

  for (var k in helpArray) {
    difference.push(k);
  }

  return difference;
}

// Array prototype function
Array.prototype.difference = function (helpArray) {
  return this.filter(function (i) {
    return helpArray.indexOf(i) < 0;
  });
};

// Lodash
var lodash = _.difference(array1, array2);

console.log(difference(array1, array2)); // ["1", "3"] + in this example "difference"
console.log(array1.difference(array2)); // [1, 3]
console.log(lodash); // [1, 3]
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/5ee7mfwL) 🚀

Wyraźną różnicę zaobserwujemy, gdy przyjdzie nam użyć metody `_.difference`. Funkcja zwraca wartości z pierwszej tablicy, które nie zostały umieszczone w drugiej tablicy (unikalne względem porównywanej tablicy). Nawet `Array.prototype`, który wykorzystywałem najczęściej, wypada blado w porównaniu z dedykowaną metodą Lodasha.

## Łączenie obiektów

```javascript
// Merge objects [Lodash]

var object1 = {
  a: {
    a1: 'test1',
    a2: 'test2',
  },
  b: {
    b1: 'test3',
    b2: 'test4',
  },
  c: 'test5',
};

var object2 = {
  d: 'test6',
};

// Basic merge function
function merge(test1, test2) {
  var merge = {};

  for (var i in test1) {
    merge[i] = test1[i];
  }
  for (var j in test2) {
    merge[j] = test2[j];
  }

  return merge;
}

// Lodash
var lodash = _.merge(object1, object2);

console.log(merge(object1, object2)); // Object {a: Object, b: Object, c: "test5", d: "test6"}
console.log(lodash); // Object {a: Object, b: Object, c: "test5", d: "test6"}
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/z6cbLtx0) 🚀

Doskonałym pomysłem, gdy chcemy połączyć obiekty, jest użycie metody `_.merge`. Metodę można wykorzystać na wiele sposobów. Dzięki dziedziczeniu właściwości obiektów, operacje na obiektach stają się bardzo proste.

```javascript
// Merge objects with properties [Lodash]

var cars = {
  data: [{ model: 'Ferrari' }, { model: 'Lamborghini' }, { model: 'Opel' }],
};

var owners = {
  data: [{ user: 'Adam' }, { user: 'Robert' }, { user: 'Karol' }],
};

lodash = _.merge(cars, owners);

console.log(lodash); // Object {data: Array[3]}
```

🚀 [Uruchom](https://jsfiddle.net/dawidrylko/gbjt5s8x) 🚀

## Lodash - podsumowanie

Lodash jest przydatną biblioteką, która pomaga zaoszczędzić sporo czasu programiście. Zmniejsza liczbę napisanych linijek, co przekłada się bezpośrednio na klarowność tego, co napiszemy.

Używam go od niedawna, ale już zauważam różnicę, gdy stosuję go w projektach. Lodash wymusza na mnie programowanie funkcyjne. Pisanie obszernych modułów czy długich metod traci sens. Wzrasta świadomość tego, co piszę, jak działają poszczególne metody, a w rezultacie cała aplikacja.

P.S. Na chwilę pisania artykułu JSFiddle ma dostępną tylko jedną wersję biblioteki Lodash (Lo-Dash 2.2.1).
