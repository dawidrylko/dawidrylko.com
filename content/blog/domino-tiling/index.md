---
title: Domino tiling
date: 2023-12-31T02:30:00.000Z
description: Artykuł przedstawia etapy tworzenia algorytmu w JavaScript, służącego do obliczania liczby możliwych układów płytek domino (pokryć dimerowych) na kwadratowej planszy o wymiarach 2n x 2n. Rozwiązanie (solver) wykorzystuje programowanie dynamiczne oraz rekurencję, działa na typach Integer i BigInt. Przygotowano również narzędzie do testowania oraz benchmark.
featuredImg: ./domino.jpg
featuredImgAlt: Płytki domino rozłożone płasko na planszy.
tags: ['math', 'javascript', 'datascience']
---

Układanie płytek domino na kwadratowej planszy 2n x 2n nie wydaje się zbyt skomplikowane. Wyliczenie ilości możliwych uładów w zależności od wymiaru planszy także nie powinno sprawić kłopotu. Problem pojawia się, gdy potrzebujemy to zrobić w rozsądnym limicie czasu.

> 1, 2, 36, 6728, 12988816, 258584046368, 53060477521960000, 112202208776036178000000, 2444888770250892795802079170816, 548943583215388338077567813208427340288, 1269984011256235834242602753102293934298576249856

## Problem

Na ile różnych sposobów można pokryć całkowicie planszę 8 x 8 płytkami domino 2 x 1?

## Rozwiązanie

W celu śledzenia stanu użyjemy maski bitowej. Rozważamy dwa główne scenariusze: obecna pozycja jest zajęta, i obecna pozycja jest wolna. Gdy pozycja jest wolna, funkcja rozważa umieszczenie domino w pionie oraz poziomie.

### W poszukiwaniu układów płytek

Sercem solvera jest funkcja rekurencyjna `searchTileArrangements`. Funkcja ta przeszukuje możliwe układy płytek domino na planszy, wykorzystując programowanie dynamiczne w celu optymalizacji.

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

Gdy `colIndex` osiągnie wartość większą lub równą niż `colCount`, następuje aktualizacja macierzy układów dla kolejnego wiersza i maski. Sposób tej aktualizacji wskazuje na wykorzystanie wcześniej obliczonych wyników w celu generowania nowych.

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

Funkcja `createInitialTilingMatrix` tworzy i inicjalizuje macierz (dwuwymiarową tablicę), która jest używan do śledzenia liczby możliwych układów płytek domino. Macierz `tilingMatrix` przechowuje wyniki pośrednie, umożliwiając uniknięcie powtórnego obliczania tych samych wartości.

```javascript
const tilingMatrix = createInitialTilingMatrix(rowCount, colCount);
```

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

W celu otrzymania rozwiązań na liczbach wykraczających poza zakres `Integer`, solver został zmodyfikowany o wersję `BigInt`. Funkcje pomocnicze wykorzystywane w solverach oraz testach i benchmarkach znajdują się w folderze `helpers`. Całe programy można znaleźć poniżej lub na moim GitHubie. W celach testowych polecam pobrać [cały folder](https://github.com/dawidrylko/dawidrylko.com/tree/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code), zamiast ręcznego tworzenia plików.

#### Cały program `Integer` - `dominoTilingSolver.js`

[dominoTilingSolver.js](https://github.com/dawidrylko/dawidrylko.com/blob/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/dominoTilingSolver.js)

Uruchomienie:

```bash
node dominoTilingSolver.js -r <rowCount> -c <colCount>
```

Kod:

```javascript
const { parseArgs } = require('./helpers');

function canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit) {
  return (
    colIndex + 1 < colCount &&
    !(currentMask & currentBit) &&
    !(currentMask & nextBit)
  );
}

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

  if (rowIndex === rowCount) {
    return;
  }

  if (colIndex >= colCount) {
    tilingMatrix[rowIndex + 1][nextMask] += tilingMatrix[rowIndex][currentMask];
    return;
  }

  const currentBit = 1 << colIndex;
  const nextBit = 1 << (colIndex + 1);

  currentMask & currentBit
    ? searchTileArrangements({ ...params, colIndex: colIndex + 1 })
    : searchTileArrangements({
        ...params,
        colIndex: colIndex + 1,
        nextMask: nextMask | currentBit,
      });

  if (canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit)) {
    searchTileArrangements({ ...params, colIndex: colIndex + 2 });
  }
}

function createInitialTilingMatrix(rowCount, colCount) {
  return Array.from({ length: rowCount + 1 }, () =>
    new Array(1 << colCount).fill(0),
  );
}

function calculateTotalTilingCombinations({ rowCount, colCount }) {
  const tilingMatrix = createInitialTilingMatrix(rowCount, colCount);
  tilingMatrix[0][0] = 1;

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

  return tilingMatrix[rowCount][0];
}

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

__main__();
```

#### Cały program `BigInt` - `dominoTilingSolver-BigInt.js`

[dominoTilingSolver-BigInt.js](https://github.com/dawidrylko/dawidrylko.com/blob/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/dominoTilingSolver-BigInt.js)

Uruchomienie:

```bash
node dominoTilingSolver-BigInt.js -r <rowCount> -c <colCount>
```

Kod:

```javascript
const { parseArgs } = require('./helpers');

function canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit) {
  return (
    colIndex + 1 < colCount &&
    !(currentMask & currentBit) &&
    !(currentMask & nextBit)
  );
}

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

  if (rowIndex === rowCount) {
    return;
  }

  if (colIndex >= colCount) {
    tilingMatrix[rowIndex + 1][nextMask] += tilingMatrix[rowIndex][currentMask];
    return;
  }

  const currentBit = BigInt(1) << BigInt(colIndex);
  const nextBit = BigInt(1) << BigInt(colIndex + 1);

  currentMask & currentBit
    ? searchTileArrangements({ ...params, colIndex: colIndex + 1 })
    : searchTileArrangements({
        ...params,
        colIndex: colIndex + 1,
        nextMask: nextMask | currentBit,
      });

  if (canSkipTwoBits(colIndex, colCount, currentMask, currentBit, nextBit)) {
    searchTileArrangements({ ...params, colIndex: colIndex + 2 });
  }
}

function createInitialTilingMatrix(rowCount, colCount) {
  return Array.from({ length: rowCount + 1 }, () =>
    new Array(1 << colCount).fill(BigInt(0)),
  );
}

function calculateTotalTilingCombinations({ rowCount, colCount }) {
  const tilingMatrix = createInitialTilingMatrix(rowCount, colCount);
  tilingMatrix[0][0] = BigInt(1);

  for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
    for (let currentMask = 0; currentMask < 1 << colCount; ++currentMask) {
      searchTileArrangements({
        tilingMatrix,
        rowCount,
        colCount,
        rowIndex,
        colIndex: 0,
        currentMask: BigInt(currentMask),
        nextMask: BigInt(0),
      });
    }
  }

  return tilingMatrix[rowCount][0];
}

function __main__() {
  const argsSchema = { '-r': 'rowCount', '-c': 'colCount' };
  const options = parseArgs(process.argv.slice(2), argsSchema);

  if (!options.rowCount || !options.colCount) {
    console.error(
      'Usage: node dominoTilingSolver-BigInt.js -r <rowCount> -c <colCount>',
    );
    process.exit(1);
  }

  const result = calculateTotalTilingCombinations(options);
  console.log(result.toString());
  process.exit(0);
}

__main__();
```

#### Funkcje pomocnicze - `helpers`

[helpers](https://github.com/dawidrylko/dawidrylko.com/tree/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/helpers)

Poniższa funkcja (`parseCommandLineArguments.js`) użyta jest w `dominoTilingSolver.js` oraz `dominoTilingSolver-BigInt.js`. Pozostałe funkcje wykorzystywane są w programie testowym oraz benchmarku.

```javascript
/**
 * Parses command line arguments based on a provided schema.
 * @param {string[]} args The command line arguments.
 * @param {Object} schema The schema defining argument mappings.
 * @returns {Object} Parsed options with their corresponding values.
 */
function parseCommandLineArguments(args, schema) {
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i];
    const nextArg = args[i + 1];

    if (schema[currentArg] && nextArg !== void 0) {
      options[schema[currentArg]] = parseInt(nextArg, 10);
      i++;
    }
  }

  return options;
}

module.exports = parseCommandLineArguments;
```

## Wynik

Dane testowe wykorzystywane w `testRunner.js` oraz `benchmarkRunner.js` znajdują się w [katalogu test-data](https://github.com/dawidrylko/dawidrylko.com/tree/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/test-data) na GitHubie.

### Test runner

Do przetestowania algorytmu utworzony został [program testRunner.js](https://github.com/dawidrylko/dawidrylko.com/blob/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/testRunner.js).

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

Obliczanie wydajności algorytmu odbywa się za pomocą [programu benchmarkRunner.js](https://github.com/dawidrylko/dawidrylko.com/blob/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/benchmarkRunner.js). Głównym celem przedstawionego benchmarku nie jest pomiar wydajności na konkretnym urządzeniu, ale demonstracja różnic w wynikach w zależności od rozmiarów planszy.

Uruchomienie programu odbywa się w konsoli za pomocą komendy:

```bash
node benchmarkRunner.js -n <numberOfExecutions>
```

Gdzie `n` to liczba egzekucji programu.

Wynik w konsoli dla wersji podstawowej, dla 10 egzekucji:

```bash
Starting benchmark execution with 10 executions each...
Executing benchmark 1 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_1x2.txt
Executing benchmark 2 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_2x2.txt
Executing benchmark 3 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_4x4.txt
Executing benchmark 4 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_6x6.txt
Executing benchmark 5 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_8x8.txt
Executing benchmark 6 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_10x10.txt
Executing benchmark 7 of 7 for dominoTilingSolver.js... File saved: benchmark/dominoTilingSolver.js_12x12.txt
All benchmarks completed successfully.
```

Zapisane wyniki znajdują się w [folderze benchmark](https://github.com/dawidrylko/dawidrylko.com/tree/aa6f26688b6282b20bd8cc240e3393e7cba6cb8b/content/blog/domino-tiling/code/benchmark).

#### Benchmark `Integer` - `dominoTilingSolver.js`

| Rozmiar | Wynik [ms] | Ilość egzekucji |
| :-----: | ---------: | --------------: |
|   1x2   |     24.942 |            1000 |
|   2x2   |     25.749 |            1000 |
|   4x4   |     24.876 |            1000 |
|   6x6   |     27.603 |            1000 |
|   8x8   |     35.453 |            1000 |
|  10x10  |     94.160 |            1000 |
|  12x12  |    505.818 |            1000 |

#### Benchmark `BigInt` - `dominoTilingSolver-BigInt.js`

| Rozmiar |    Wynik [ms] | Ilość egzekucji |
| :-----: | ------------: | --------------: |
|   1x2   |        28.280 |            1000 |
|   2x2   |        29.005 |            1000 |
|   4x4   |        28.594 |            1000 |
|   6x6   |        31.335 |            1000 |
|   8x8   |        44.904 |            1000 |
|  10x10  |       145.033 |            1000 |
|  12x12  |       833.903 |            1000 |
|  14x14  |     5,615.200 |              10 |
|  16x16  |    37,765.400 |              10 |
|  18x18  |   248,372.000 |               1 |
|  20x20  | 1,640,246.000 |               1 |

## Źródła

- [Number of domino tilings (or dimer coverings) of a 2n X 2n square](https://oeis.org/A004003)
- [Richard Kenyon: An introduction to the dimer model](https://doi.org/10.48550/arXiv.math/0310326)
