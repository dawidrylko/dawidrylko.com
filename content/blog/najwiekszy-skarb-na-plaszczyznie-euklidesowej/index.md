---
title: Największy skarb na płaszczyźnie euklidesowej
date: 2023-11-27T19:26:44.200Z
description: Sprawdź, jak za pomocą jednego programu w języku JavaScript rozwiązać problem znajdowania najcenniejszych punktów w dwuwymiarowej przestrzeni euklidesowej. Odkryj, jak działa algorytm, który znajduje k-elementowy podzbiór punktów o maksymalnej sumie odległości między nimi.
featuredImg: ./pin-on-the-map.jpg
featuredImgAlt: Mapa kartograficzna z przypinanymi do niej czerwonymi pinezkami. Photo by GeoJango Maps on Unsplash.
tags: ['math', 'javascript', 'datascience']
---

Czy kiedykolwiek zastanawialiście się, jak za pomocą jednego algorytmu można odnaleźć najcenniejsze punkty w dwuwymiarowej przestrzeni? W dzisiejszym wpisie zgłębimy to zagadnienie mające zastosowanie w dziedzinach, takich jak analiza danych, grafika komputerowa czy algorytmy optymalizacyjne.

## Problem

Dany jest zbiór $P$ zawierający punkty na płaszczyźnie euklidesowej. Celem jest znalezienie $k$-elementowego podzbioru $Q$ o maksymalnej sumie odległości między punktami.

Zdefiniowany problem możemy zapisać za pomocą wzoru:

$
Q^* = \underset{Q \subseteq P, |Q| = k}{\arg\max} \sum_{\lbrace u,v \rbrace \subseteq Q} d(u, v)
$

gdzie $d(u, v)$ to odległość między punktami $u$ i $v$.

## Rozwiązanie

Opisany powyżej problem zostanie rozwiązany za pomocą programu napisanego w języku **JavaScript**.

### Odległość między dwoma punktami

Pierwszym elementem składowym jest funkcja obliczająca odległość między dwoma punktami na płaszczyźnie euklidesowej. Łatwiej można to zrozumieć, wyobrażając sobie długość odcinka pomiędzy tymi punktami. Formalnie, odległość między punktem $P_1(x_1, y_1)$, a punktem $P_2(x_2, y_2)$ możemy wyrazić wzorem:

$
d(P_1, P_2) = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}
$

Funkcja `calculateDistance` to implementacja powyższego wzoru w języku JavaScript. Przyjmując punkty $P_1$ o współrzędnych $(x_1, y_1)$ i $P_2$ o współrzędnych $(x_2, y_2)$, odległość euklidesowa między punktami to pierwiastek kwadratowy z sumy kwadratów różnic współrzędnych.

```javascript
function calculateDistance(point1, point2) {
  return Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);
}
```

W powyższym kodzie:

- `(point1[0] - point2[0])` - oblicza różnicę współrzędnych $x$ między punktami.
- `(point1[1] - point2[1])` - oblicza różnicę współrzędnych $y$ między punktami.
- `** 2` - podnosi każdy wynik do kwadratu.
- `Math.sqrt(...)` - oblicza pierwiastek kwadratowy z sumy kwadratów, co daje nam ostateczną odległość euklidesową między punktami `point1` i `point2`.

### Największy podzbiór

Drugą składową będzie funkcja `findLargestDistanceSubset`. Ma ona na celu znalezienie $k$-elementowego podzbioru $Q$ z danego zbioru punktów $P$. Suma odległości między każdą parą punktów ma być jak największa.

```javascript
function findLargestDistanceSubset(points, k) {
  const n = points.length;
  const Q = [];
  const distances = new Array(n);

  // Obliczanie sum odległości...

  return { distanceSum, selectedIndexes: Q };
}
```

W powyższym kodzie:

- `n` - liczba punktów w zbiorze $P$.
- `Q` - początkowo pusty zbiór, który będzie przechowywał wybrane punkty.
- `distances` - tablica, w której `distances[i]` jest sumą odległości punktu $i$ od pozostałych punktów.

Algorytm zwraca obiekt zawierający sumę odległości (`distanceSum`) oraz indeksy wybranych punktów (`Q`).

#### Obliczanie sum odległości

Dla każdego punktu $i$ w zbiorze $P$, obliczamy sumę odległości od wszystkich innych punktów. Wartość ta zostaje zapisana w tablicy `distances[i]`.

$
\text{distances}[i] = \sum_{j=0}^{n-1} d(\text{points}[i], \text{points}[j])
$

gdzie $d(P_1, P_2)$ to odległość euklidesowa między punktami $P_1$ i $P_2$, co jest obliczane za pomocą funkcji `calculateDistance`.

```javascript
for (let i = 0; i < n; i++) {
  let distanceSum = 0;
  for (let j = 0; j < n; j++) {
    distanceSum += calculateDistance(points[i], points[j]);
  }
  distances[i] = distanceSum;
}
```

#### Wybieranie punktów do $Q$

Algorytm iteracyjnie dodaje do zbioru $Q$ punkt, który maksymalizuje wzrost sumy odległości w $Q$.

```javascript
while (Q.length < k) {
  let maxIncrease = -1;
  let bestPoint = null;

  // Wzrost sumy odległości...

  if (bestPoint !== null) {
    Q.push(bestPoint);
  } else {
    break;
  }
}
```

W powyższym kodzie:

- `maxIncrease` - zmienna przechowująca dotychczasowy maksymalny wzrost sumy odległości.
- `bestPoint` - indeks punktu, który jest najlepszym kandydatem do dodania do $Q$.

##### Wzrost sumy odległości

Dla każdego punktu $i$ spoza $Q$, obliczamy wzrost sumy odległości, jaki byłby uzyskany po dodaniu punktu $i$ do $Q$.

$
\text{increase} = \sum_{j=0}^{k-1} \left( \text{distances}[i] - d(\text{points}[i], \text{points}[Q[j]]) \right)
$

Jeśli `increase` jest większe od `maxIncrease`, wtedy aktualizujemy `maxIncrease` i `bestPoint`.

```javascript
for (let i = 0; i < n; i++) {
  if (!Q.includes(i)) {
    let increase = 0;

    for (let j = 0; j < Q.length; j++) {
      increase += distances[i] - calculateDistance(points[i], points[Q[j]]);
    }

    if (increase > maxIncrease) {
      maxIncrease = increase;
      bestPoint = i;
    }
  }
}
```

#### Obliczanie sumy odległości w $Q$

Po wybraniu $k$ punktów, obliczamy sumę odległości między każdą parą punktów w $Q$.

$
\text{distanceSum} = \sum*{i=0}^{k-1} \sum*{j=i+1}^{k-1} d(\text{points}[Q[i]], \text{points}[Q[j]])
$

```javascript
let distanceSum = 0;
for (let i = 0; i < Q.length; i++) {
  for (let j = i + 1; j < Q.length; j++) {
    distanceSum += calculateDistance(points[Q[i]], points[Q[j]]);
  }
}
```

#### Cała funkcja

```javascript
function findLargestDistanceSubset(points, k) {
  const n = points.length;
  const Q = [];
  const distances = new Array(n);

  for (let i = 0; i < n; i++) {
    let distanceSum = 0;
    for (let j = 0; j < n; j++) {
      distanceSum += calculateDistance(points[i], points[j]);
    }
    distances[i] = distanceSum;
  }

  while (Q.length < k) {
    let maxIncrease = -1;
    let bestPoint = null;

    for (let i = 0; i < n; i++) {
      if (!Q.includes(i)) {
        let increase = 0;
        for (let j = 0; j < Q.length; j++) {
          increase += distances[i] - calculateDistance(points[i], points[Q[j]]);
        }

        if (increase > maxIncrease) {
          maxIncrease = increase;
          bestPoint = i;
        }
      }
    }

    if (bestPoint !== null) {
      Q.push(bestPoint);
    } else {
      break;
    }
  }

  let distanceSum = 0;
  for (let i = 0; i < Q.length; i++) {
    for (let j = i + 1; j < Q.length; j++) {
      distanceSum += calculateDistance(points[Q[i]], points[Q[j]]);
    }
  }

  return { distanceSum, selectedIndexes: Q };
}
```

## Uruchomienie

Do uruchomienia potrzebujemy funkcji `main`, która pełni rolę wejścia do programu.

```javascript
function main() {
  const args = process.argv.slice(2);
  let options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-f' && i + 1 < args.length) {
      options.file = args[i + 1];
      i++;
    } else if (args[i] === '-k' && i + 1 < args.length) {
      options.k = parseInt(args[i + 1]);
      i++;
    }
  }

  if (!options.file || !options.k) {
    console.log('Usage: node prog.js -f <file> -k <k>');
    return;
  }

  const data = fs.readFileSync(options.file, 'utf-8');
  const points = data
    .trim()
    .split('\n')
    .map(line => {
      const [x, y] = line.split(',').map(Number);
      return [x, y];
    });

  if (points.length < options.k) {
    console.log('The value of k is larger than the number of points.');
    return;
  }

  const result = findLargestDistanceSubset(points, options.k);

  console.log(result.distanceSum.toFixed(2));
  console.log(result.selectedIndexes.join(', '));
}
```

Jest odpowiedzialna za:

- pobranie argumentów z linii komend,
- przetworzenie argumentów i ustawienie opcji,
- obsługę błędów,
- odczytanie danych z pliku,
- przetworzenie danych,
- **wywołanie algorytmu**,
- **wyświetlanie wyników**.

Cały program można znaleźć
[tu](https://raw.githubusercontent.com/dawidrylko/dawidrylko.com/master/content/blog/najwiekszy-skarb-na-plaszczyznie-euklidesowej/code/prog.js),
a przykładowe punkty znajdują się
[tu](https://raw.githubusercontent.com/dawidrylko/dawidrylko.com/master/content/blog/najwiekszy-skarb-na-plaszczyznie-euklidesowej/code/points.txt).

Aby skorzystać z programu, należy go uruchomić z odpowiednimi parametrami, na przykład:

```bash
node prog.js -f points.txt -k 4
```

- `node prog.js` - uruchamia program napisany w języku JavaScript. Wymagany **NodeJS**.
- `-f points.txt` - określa plik, w którym znajdują się dane z punktami.
- `-k 4` - określa rozmiar poszukiwanego podzbioru punktów.

## Wynik

Program wypisuje sumę odległości między punktami w wybranym podzbiorze oraz indeksy tych punktów. Przykład dla danych testowych z `points.txt`:

```bash
59.82
0, 91, 9, 99
```

Oznacza to, że punkty $Q$ o współrzędnych $(0, 0)$, $(9, 1)$, $(0, 9)$, i $(9, 9)$ tworzą podzbiór, dla którego suma odległości między punktami jest największa spośród wszystkich możliwych 4-elementowych podzbiorów. Wartość tej sumy wynosi $59.82$.

Złożoność czasowa algorytmu wynosi $O(n^2 + k \cdot n)$, gdzie $n$ to liczba punktów w zbiorze $P$. Algorytm iteracyjnie dodaje punkty do zbioru, wybierając te, które maksymalizują sumę odległości.
