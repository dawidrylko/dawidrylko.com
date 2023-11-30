---
title: Flexbox Layout – część 2 – children items
date: 2016-06-05T18:23:04.200Z
description: Odkryj Flexbox. Czas na drugi wpis z serii Flexbox Layout. Tym razem skupimy się na potomkach kontenera – czyli children items. Odkryj właściwości takie jak `order`, `flex-grow`, `flex-shrink`, `flex-basis` oraz `flex`. Ten artykuł pomoże ci zrozumieć, jak skutecznie zarządzać rozmieszczeniem i przestrzenią dla elementów wewnątrz kontenera.
featuredImg: ./books.jpg
featuredImgAlt: Równo poukładane książki na półkach w bibliotece. Photo by Eilis Garvey on Unsplash.
tags: [css]
---

Rozdysponowanie elementów wewnątrz kontenera wcale nie jest takie proste. Czas na drugi wpis z serii **Flexbox Layout**, tym razem poświęcony potomkom kontenera – czyli **children items**.

Artykuł stanowi kontynuację serii. Pierwszy artykuł możesz przeczytać, klikając w: [Flexbox Layout – część 1 – parent container](/flexbox-layout-czesc-1-parent-container/).

![Flex children - kontener nadrzędny z kontenerami w środku. Czerwony tekst 'Potomkowie', z którego wychodzą cztery czerwone strzałki skierowane na kontenery w środku.](./flex-children.png)

**Flex items** to wszystkie obiekty wewnątrz kontenera z zadeklarowaną wartością `flex`. To właśnie operacje na potomkach oraz przypisanie im odpowiednich styli sprawiają, że cały układ zachowa się w możliwie najlepszy (co za tym idzie najbardziej optymalny) sposób.

## Właściwości potomka (children items)

### Flexbox Layout – Order

```css
.item {
  order: NUMBER; /* default 0 */
}
```

![Flex order - przedstawiona została kolejność kontenerów flexbox: (1, 2, 3, 4), (1, 1, 1, 2), (-2, -1, 0, 6), (1, 2, 3, 4).](./flex-order.png)

Standardowo elementy w kontenerze są ułożone w kolejności występowania w pliku **HTML**. Kolejnością można jednak bez problemu sterować poprzez zastosowanie właściwości `order`.

### Flexbox Layout – Flex grow

```css
.item {
  flex-grow: NUMBER; /* default 0 */
}
```

Właściwość `flex-grow` umożliwia elementom powiększenie się, jeśli tego potrzebują. Przedstawiona właściwość przyjmuje wartość numeryczną. Wartość ta jest **proporcją**, zadeklarowanego dla elementu miejsca, względem całego wykorzystanego miejsca wewnątrz **kontenera flex**.

![Flex grow - przedstawiona została szerokość kontenerów flexbox. W pierwszym rzędzie kontenery mają taką samą szerokość (1). W drugim rzędzie jeden kontener jest dwa razy szerszy (2) niż pozostałe (1).](./flex-grow.png)

Jeśli wszystkim elementom wewnątrz kontenera zostanie przyporządkowana właściwość `flex-grow: 1`, to kontener rozdysponuje miejsce w taki sposób, aby wszystkie elementy dostały tyle samo miejsca. Jeśli zadeklarujemy wybranemu elementowi `flex-grow: 2`, a pozostałym `flex-grow: 1`, to wybrany element dostanie dwie wartości przypadające z podziału.

**Ujemne wartości zostają oznaczone jako błędne.**

### Flexbox Layout – Flex shrink

```css
.item {
  flex-shrink: NUMBER; /* default 1 */
}
```

Właściwość `flex-shrink` pozwala elementom na zmniejszanie się, jeśli jest to potrzebne.

**Ujemne wartości zostają oznaczone jako błędne.**

### Flexbox Layout – Flex basis

```css
.item {
  flex-basis: auto | SIZE; /* default auto */
}
```

Podstawową wielkość elementu wewnątrz **flexible container** uzyskujemy dzięki właściwości `flex-basis`. Brak zadeklarowanej wartości oznacza przyjęcie domyślnej – czyli `auto`. Inne wykorzystanie tej właściwości to podanie długości – np. `200px`, `20em`, `20%` itp.

### Flexbox Layout – Flex

```css
.item {
  flex: none | [ FLEX_GROW FLEX_SHRINK || FLEX_BASIS];
}
```

`flex` jest skrótem dla `flex-grow`, `flex-shrink` oraz `flex-basis`. Wg rekomendacji **W3C** zaleca się używanie właśnie tej właściwości, zamiast deklarowania wszystkich powyższych. Ponadto, przy niezadeklarowaniu wszystkich właściwości, skrót `flex` uzupełnia je automatycznie (kolejno `0 1 auto`).

Kolejny wpis z tej serii poświęcony będzie wyrównaniu kontenera i elementów znajdujących się wewnątrz niego.
