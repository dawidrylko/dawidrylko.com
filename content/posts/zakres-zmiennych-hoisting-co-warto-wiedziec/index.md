---
title: Zakres zmiennych, hoisting - co warto wiedzieć?
date: 2017-09-04T19:14:04.000Z
description: W tym artykule omówimy pojęcia zakresu zmiennych i hoistingu. Dlaczego zmienne zadeklarowane przez `var` zachowują swoją wartość poza pętlą? Jak `let` i `const` zmieniły podejście do zakresu zmiennych? Odkryjemy również, jak hoisting wpływa na porządek deklaracji zmiennych i funkcji. Sprawdzimy, jakie dodatkowe zabezpieczenia wprowadza tryb ścisły (`strict mode`). Zobacz przykłady i zyskaj pewność w korzystaniu z tych kluczowych elementów JavaScript.
featuredImg: ./elevator.jpg
featuredImgAlt: Fotografia eleganckiego wnętrza z białymi ścianami i srebrnymi drzwiami windy. Photo by Edwin Chen on Unsplash.
tags: ['javascript']
---

Koniec wakacji, czas brać się do roboty 🙂 W tym wpisie postaram się krótko i treściwie omówić **zakres zmiennych i hoisting** w JavaScript.

## Zakres zmiennych

**Zakres zmiennych** w JavaScript, to temat nieco skomplikowany. Programista, który dopiero zaczyna swoją przygodę z JSem, może być w niemałym szoku próbując okiełznać tajniki sztuki.

```javascript
for (var a = 0; a < 5; a++) {}
console.log(a); // 5
```

Na początek stwórzmy standardową pętlę `for`, w której deklarujemy zmienną `a = 0`. Poniżej odwołujemy się do tej zmiennej i jako rezultat dostajemy `5`.

**Wniosek:** Deklaracja zmiennej poprzez słowo kluczowe `var` powoduje zalokowanie miejsca w pamięci i zachowanie stanu pomimo zakończenia pętli. Zmienna jest widoczna w kontekście funkcji.

### Na ratunek `let` i `const`

W standardzie **ECMAScript 2015** (ES6) wprowadzone zostały nowe słowa kluczowe `let` i `const`. Służą do tego samego co `var`, ale mają ograniczony zasięg.

> let is the new var.

```javascript
for (let a = 0; a < 5; a++) {}
console.log(a); // Uncaught ReferenceError: a is not defined
```

Jak widzimy w powyższym przykładzie, zamiana `var` na `let` daje wymierny skutek. Nie mamy dostępu do zmiennej poza blokiem `for`. O to nam chodziło... wykorzystujemy zmienną z kontekstu blokowego.

Jak się ma do tego `const`?

> Deklaruje nazwaną stałą tylko do odczytu - [MDN](https://web.archive.org/web/20190405135739/https://developer.mozilla.org/pl/docs/Web/JavaScript/Referencje/Polecenia/const)

Nie możemy ponownie przypisać wartości do `const`:

```javascript
const a = 7;
a = 5; // Uncaught TypeError: Assignment to constant variable.
```

Nie możemy też ponownie zadeklarować stałej:

```javascript
const a = 7;
const a = 5; // Uncaught SyntaxError: Identifier 'a' has already been declared
```

JS ma jednak swoje wymagania, a `const` może sporadycznie piszących w tym języku wprowadzić w błąd.

```javascript
const a = [];
console.log(a); // []
a.push(2);
console.log(a); // [2]
a.push({ a: 3 });
console.log(a); // [2, {a: 3}]
```

W JavaScript `const` **NIE** oznacza deklaracji **stałej wartości**, lecz deklarację **stałej referencji**. W przypadku typów prymitywnych `const` zachowuje się tak jak oczekujemy. Przy typach złożonych mamy możliwość podmiany zawartości.

Idealnie obrazuje to przykład powyżej. Tworzymy stałą `a = []`, następnie poprzez metodę `push` dodajemy pierwszy element tablicy, itd.

## Hoisting

Temat hoistingu jest często poruszany, zarówno na branżowych spotkaniach jak i rozmowach kwalifikacyjnych. To jeden z feature'ów JSa, o którym wszyscy słyszeli lub wkrótce usłyszą.

Hoisting, spolszczona nazwa windowanie, to mechanizm pozwalający na przeniesienie deklaracji zmiennych oraz metod na początek funkcji.

```javascript
a = 5;
var a;
console.log(a); // 5
```

i

```javascript
simpleFunction(); // hoisting

function simpleFunction() {
  console.log('hoisting');
}
```

W przykładzie pierwszym do zmiennej `a` przypisujemy `5`, następnie ją deklarujemy. Log w konsoli daje rezultat `5`. Drugi przykład, to wywołanie metody przed deklaracją. Rezultat taki sam jak wcześniej. Hoisting zadziałał.

Przy deklaracji zmiennych za pomocą słowa kluczowego `let`, hoisting zachowuje się bardziej przewidywalnie.

```javascript
a = 5;
let a; // ReferenceError: a is not defined
```

### Strict mode

**Strict mode** (tryb ścisły) to jeden z feature'ów **ES5**. Wprowadza kilka zmian do domyślnej semantyki JavaScript:

1. Pozwala wyeliminować ciche błędy (ang. silent errors).
1. Pozwala wyeliminować błędy, które uniemożliwiają optymalizację JSa przez przeglądarki.
1. Uniemożliwia stosowanie składni mogącej wystąpić w kolejnych odsłonach ECMAScript.

Temat został pobieżnie wywołany, przy okazji hoistingu, nie bez przyczyny. **Strict mode** nie zezwala na skorzystanie ze zmiennej, dopóki nie zostanie zadeklarowana.

## Źródła

- [const - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [let - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [var - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [Strict mode - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
- [ES6 In Depth: let and const - Mozilla Hacks](https://hacks.mozilla.org/2015/07/es6-in-depth-let-and-const/)
