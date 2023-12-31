---
title: Domino tiling
date: 2023-12-31T02:30:00.000Z
description: Artykuł przedstawia etapy tworzenia algorytmu w JavaScript, służącego do obliczania liczby możliwych układów płytek domino (pokryć dimerowych) na kwadratowej planszy o wymiarach 2n x 2n. Przygotowano rozwiązanie (solver) z wykorzystaniem typu Integer i BigInt, narzędzie do testowania oraz benchmark.
featuredImg: ./domino.jpg
featuredImgAlt: Płytki domino rozłożone płasko na planszy.
tags: ['javascript', 'datascience']
---

Układanie płytek domino na kwadratowej planszy 2n x 2n nie wydaje się zbyt skomplikowane. Wyliczenie ilości możliwych uładów w zależności od wymiaru planszy także nie powinno sprawić kłopotu. Problem pojawia się, gdy potrzebujemy to zrobić w rozsądnym limicie czasu.

> 1, 2, 36, 6728, 12988816, 258584046368, 53060477521960000, 112202208776036178000000, 2444888770250892795802079170816, 548943583215388338077567813208427340288, 1269984011256235834242602753102293934298576249856

## Problem

Na ile różnych sposobów można pokryć całkowicie planszę 8 x 8 płytkami domino 2 x 1?

## Rozwiązanie

W celu śledzenia stanu użyjemy maski bitowej. Rozważamy dwa główne scenariusze: obecna pozycja jest zajęta, i obecna pozycja jest wolna. Gdy pozycja jest wolna, funkcja rozważa umieszczenie domino w pionie oraz poziomie.

### W poszukiwaniu układów płytek

Sercem solvera jest funkcja rekurencyjna `searchTileArrangements`. Funkcja ta przeszukuje możliwe układy płytek domino na planszy.

#### Parametry

Parametry tej funkcji to: `tilingMatrix`, `rowCount`, `colCount`, `rowIndex`, `colIndex`, `currentMask`, `nextMask`.

```javascript
function searchTileArrangements(params) {
  const {
    tilingMatrix,
    rowCount,
    colCount,
    rowIndex,
    colIndex,
    currentMask,
    nextMask,
  } = params;

  ...
}
```

#### Zakończenie działania funkcji

Po destrukturyzacji parametrów rozpoczynamy serię sprawdzeń. Zakończenie działania następuje, gdy `rowIndex` jest równy `rowCount`.

```javascript
if (rowIndex === rowCount) {
  return;
}
```

Gdy `colIndex` osiągnie wartość większą lub równą `colCount`, aktualizujemy macierz układów dla następnego wiersza i maski.

```javascript
if (colIndex >= colCount) {
  tilingMatrix[rowIndex + 1][nextMask] += tilingMatrix[rowIndex][currentMask];
  return;
}
```

#### Obliczanie bitów

Następnie obliczamy bity reprezentujące obecną oraz następną kolumnę.

```javascript
const currentBit = 1 << colIndex;
const nextBit = 1 << (colIndex + 1);
```

#### Rekurencyjne wywołanie

Gdy aktualny bit jest zajęty, rozpoczynamy rekurencyjne wywołanie z aktualizacją `colIndex + 1` (płytka domino w pionie). W sytuacji przeciwnej, oprócz aktualizacji `colIndex + 1`, aktualizujemy również `nextMask` poprzez operację bitową OR (`nextMask | currentBit`).

```javascript
currentMask & currentBit
  ? searchTileArrangements({ ...params, colIndex: colIndex + 1 })
  : searchTileArrangements({
      ...params,
      colIndex: colIndex + 1,
      nextMask: nextMask | currentBit,
    });
```

#### Pominięcie dwóch bitów

Aktualizacja `colIndex + 2` następuje, gdy można pominąć dwa bity.

```javascript
if (canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit)) {
  searchTileArrangements({ ...params, colIndex: colIndex + 2 });
}
```

Funkcja sprawdzająca, czy możliwe jest pominięcie dwóch bitów (płytka domino w poziomie), prezentuje się następująco.

```javascript
function canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit) {
  return (
    colIndex + 1 < colCount &&
    !(currentMask & currentBit) &&
    !(currentMask & nextBit)
  );
}
```

### Obliczanie ilości uładów

Wyodrębnienie funkcji `calculateTotalTilingCombinations` to kwestia gustu.

```javascript
function calculateTotalTilingCombinations({ rowCount, colCount }) {
...
}
```

Potrzebne było mi miejsce, gdzie będę mógł stworzyć i zainicjalizować macierz, ustawić punkt startowy dla algorytmu, rozpocząć iteracje oraz zwrócić wynik.

#### Utworzenie macierzy początkowej

Funkcja `createInitialTilingMatrix` tworzy i inicjalizuje macierz (dwuwymiarową tablicę), która jest używana do śledzenia liczby możliwych układów płytek domino.

Każdy wiersz odpowiada stanowi wiersza na planszy. Każda kolumna w wierszu odpowiada możliwemu układowi płytek w danym wierszu. Reprezentacja odbywa się za pomocą maski bitowej.

```javascript
function createInitialTilingMatrix(rowCount, colCount) {
  return Array.from({ length: rowCount + 1 }, () =>
    new Array(1 << colCount).fill(0),
  );
}
```

#### Ustawienie punktu startowego

Pierwszy element to lewy górny róg macierzy. `1` oznacza, że mamy jedną kombinację dla pustej planszy.

```javascript
tilingMatrix[0][0] = 1;
```

#### Iteracja

Poszukiwania rozpoczynamy od dwóch pętli `for`. Najpierw przez wszystkie wiersze macierzy, następnie wszystkie możliwe kombinacje (maski) dla danego wiersza.

```javascript
for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
  for (let currentMask = 0; currentMask < 1 << colCount; ++currentMask) {
    searchTileArrangements({
      tilingMatrix,
      rowCount,
      colCount,
      rowIndex,
      colIndex: 0,
      currentMask,
      nextMask: 0,
    });
  }
}
```

#### Zwrócenie wyniku

```javascript
return tilingMatrix[rowCount][0];
```

### Uruchomienie

Rolę wejścia do programu pełni funkcja `__main__`.

```javascript
function __main__() {
  const argsSchema = { '-r': 'rowCount', '-c': 'colCount' };
  const options = parseArgs(process.argv.slice(2), argsSchema);

  if (!options.rowCount || !options.colCount) {
    console.error(
      'Usage: node dominoTilingSolver.js -r <rowCount> -c <colCount>',
    );
    process.exit(1);
  }

  const result = calculateTotalTilingCombinations(options);
  console.log(result);
  process.exit(0);
}
```

Funkcja odpowiedzialna jest za:

- pobranie argumentów z linii komend,
- przetworzenie argumentów i ustawienie opcji,
- obsługę błędów,
- uruchomienie solvera,
- wyświetlanie wyników.

### Cały program

W celu otrzymania rozwiązań na liczbach wykraczających poza zakres `Integer`, solver został zmodyfikowany o wersję `BigInt`. Funkcje pomocnicze wykorzystywane w solverach oraz testach i benchmarkach znajdują się w folderze `helpers`. Programy można znaleźć na moim GitHubie lub klikając w linki poniżej.

- [dominoTilingSolver.js](https://github.com/dawidrylko/dawidrylko.com/blob/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/dominoTilingSolver.js)
- [dominoTilingSolver-BigInt.js](https://github.com/dawidrylko/dawidrylko.com/blob/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/dominoTilingSolver-BigInt.js)
- [helpers](https://github.com/dawidrylko/dawidrylko.com/tree/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/helpers)

## Wynik

Dane testowe wykorzystywane w `testRunner.js` oraz `benchmarkRunner.js` znajdują się w [katalogu test-data](https://github.com/dawidrylko/dawidrylko.com/tree/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/test-data) na GitHubie.

### Test runner

Do przetestowania algorytmu utworzony został [program testRunner.js](https://github.com/dawidrylko/dawidrylko.com/blob/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/testRunner.js).

Uruchamiamy program za pomocą komendy w konsoli:

```bash
node testRunner.js
```

Wynik w konsoli dla wersji podstawowej:

```bash
Starting test execution...
Executing test 1 of 7 for dominoTilingSolver.js... Passed!
Executing test 2 of 7 for dominoTilingSolver.js... Passed!
Executing test 3 of 7 for dominoTilingSolver.js... Passed!
Executing test 4 of 7 for dominoTilingSolver.js... Passed!
Executing test 5 of 7 for dominoTilingSolver.js... Passed!
Executing test 6 of 7 for dominoTilingSolver.js... Passed!
Executing test 7 of 7 for dominoTilingSolver.js... Passed!
All tests completed successfully.
```

### Benchmark runner

Obliczanie wydajności algorytmu odbywa się za pomocą [programu benchmarkRunner.js](https://github.com/dawidrylko/dawidrylko.com/blob/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/benchmarkRunner.js).

Uruchomienie programu odbywa się w konsoli za pomocą komendy:

```bash
node benchmarkRunner.js -n 10
```

Gdzie `n` to liczba egzekucji programu.

Wynik w konsoli dla wersji podstawowej:

```bash
Starting benchmark execution with 1 executions each...
Executing benchmark 1 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_1x2.txt
Executing benchmark 2 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_2x2.txt
Executing benchmark 3 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_4x4.txt
Executing benchmark 4 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_6x6.txt
Executing benchmark 5 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_8x8.txt
Executing benchmark 6 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_10x10.txt
Executing benchmark 7 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_12x12.txt
All benchmarks completed successfully.
```

Zapisane wyniki znajdują się w [folderze benchmark](https://github.com/dawidrylko/dawidrylko.com/tree/630ff7db3b716c6ad57678e9efcbbb80eb43d4e5/content/blog/domino-tiling/code/benchmark).

#### dominoTilingSolver.js

| Rozmiar |      Wynik | Ilość powtórzeń |
| :-----: | ---------: | --------------: |
|   1x2   |  24.942 ms |            1000 |
|   2x2   |  25.749 ms |            1000 |
|   4x4   |  24.876 ms |            1000 |
|   6x6   |  27.603 ms |            1000 |
|   8x8   |  35.453 ms |            1000 |
|  10x10  |  94.160 ms |            1000 |
|  12x12  | 505.818 ms |            1000 |

#### dominoTilingSolver-BigInt.js

| Rozmiar |            Wynik | Ilość powtórzeń |
| :-----: | ---------------: | --------------: |
|   1x2   |        28.280 ms |            1000 |
|   2x2   |        29.005 ms |            1000 |
|   4x4   |        28.594 ms |            1000 |
|   6x6   |        31.335 ms |            1000 |
|   8x8   |        44.904 ms |            1000 |
|  10x10  |       145.033 ms |            1000 |
|  12x12  |       833.903 ms |            1000 |
|  14x14  |     5,615.200 ms |              10 |
|  16x16  |    37,765.400 ms |              10 |
|  18x18  |   248,372.000 ms |               1 |
|  20x20  | 1,640,246.000 ms |               1 |

## Źródła

- [Number of domino tilings (or dimer coverings) of a 2n X 2n square](https://oeis.org/A004003)
- [Richard Kenyon: An introduction to the dimer model](https://doi.org/10.48550/arXiv.math/0310326)
