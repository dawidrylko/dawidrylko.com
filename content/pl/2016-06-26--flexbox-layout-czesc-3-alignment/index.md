---
title: Flexbox Layout - część 3 - alignment
date: 2016-06-26T17:30:00.000Z
description: Odkryj Flexbox. Ostatni wpis z serii Flexbox Layout o wyrównaniu kontenera i elementów, czyli justify-content, align-items, align-content i align-self.
tags: ['css']
---

Wyśrodkowanie elementu w pionie przez lata było w **CSS** tematem rzeką. Czas na trzeci i ostatni wpis z serii **Flexbox Layout**, tym razem poświęcony wyrównaniu kontenera i elementów znajdujących się wewnątrz niego.

Poprzednie artykuły możesz przeczytać, klikając w: [Flexbox Layout - część 1 - parent container](/flexbox-layout-czesc-1-parent-container/) oraz [Flexbox Layout - część 2 - children items](/flexbox-layout-czesc-2-children-items/).

Przyda się jedno nowe pojęcie. Kierunek **main-axis** (głównej osi) wyznacza `flex-direction`, a prostopadle do niej biegnie **cross-axis** (oś poprzeczna). Przy `flex-direction: row` główna oś jest pozioma, a poprzeczna pionowa. Przy `column` jest odwrotnie.

## Wyrównanie w kontenerze (parent container)

### Flexbox Layout - Justify content

```css
.container {
  justify-content: flex-start | flex-end | center | space-between | space-around;
}
```

Właściwość `justify-content` ustawia elementy wzdłuż głównej osi i rozdziela wolne miejsce, które zostało w linii. Gdy całe miejsce zabierze element z `flex-grow: 1`, nie ma już czego rozdzielać.

- `flex-start` - (wartość domyślna) - elementy przy początku linii
- `flex-end` - elementy przy końcu linii
- `center` - elementy na środku linii
- `space-between` - pierwszy element przy początku linii, ostatni przy końcu, a między sąsiednimi równe odstępy
- `space-around` - równe odstępy między elementami, a przy krawędziach linii połowa tego odstępu

### Flexbox Layout - Align items

```css
.container {
  align-items: flex-start | flex-end | center | baseline | stretch;
}
```

Właściwość `align-items` działa podobnie, ale na osi poprzecznej: ustawia elementy wewnątrz linii.

- `flex-start` - elementy przy początku linii
- `flex-end` - elementy przy końcu linii
- `center` - elementy na środku linii
- `baseline` - elementy wyrównane do linii bazowych tekstu (przy `flex-direction: column` działa jak `flex-start`)
- `stretch` - (wartość domyślna) - elementy rozciągnięte na rozmiar linii, w granicach `min-*` i `max-*`

Rozciąganie działa tylko wtedy, gdy rozmiar elementu w osi poprzecznej ma wartość `auto`, a żaden z jego marginesów na tej osi nie ma wartości `auto`. To dlatego kolumny w jednym rzędzie mają domyślnie równą wysokość, co przy `float` wymagało sztuczek.

### Flexbox Layout - Align content

```css
.container {
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

Gdy elementy zawijają się na kilka linii, w osi poprzecznej może zostać wolne miejsce, na przykład w kontenerze o zadeklarowanej wysokości. Właściwość `align-content` ustawia wtedy całe linie wewnątrz kontenera.

- `flex-start` - linie przy początku kontenera
- `flex-end` - linie przy końcu kontenera
- `center` - linie na środku kontenera
- `space-between` - pierwsza linia przy początku, ostatnia przy końcu, a między sąsiednimi równe odstępy
- `space-around` - równe odstępy między liniami, a przy krawędziach kontenera połowa tego odstępu
- `stretch` - (wartość domyślna) - linie dzielą między siebie wolne miejsce

**W kontenerze jednoliniowym (`flex-wrap: nowrap`) właściwość `align-content` nie działa.**

Decyduje o tym deklaracja `flex-wrap`, a nie faktyczna liczba linii, więc kontener z `flex-wrap: wrap` jest wieloliniowy także wtedy, gdy wszystkie elementy zmieściły się w jednej linii. Domyślną wartością jest `nowrap`, dlatego samo `align-content` bez zawijania niczego nie zmieni.

## Wyrównanie potomka (children items)

### Flexbox Layout - Align self

```css
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch; /* default auto */
}
```

Właściwość `align-self` nadpisuje dla pojedynczego elementu wartość `align-items` z kontenera. Domyślne `auto` przejmuje tę wartość od rodzica, a pozostałe działają tak samo jak w `align-items`.

Jeśli któryś z marginesów elementu w osi poprzecznej ma wartość `auto`, właściwość `align-self` nie ma żadnego efektu.

## Wyśrodkowanie elementu

Na koniec temat rzeka z początku wpisu. Wystarczy kontener o określonej wysokości:

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
```

Potomek stanie na środku w obu osiach, bez względu na swój rozmiar.

Dokładny algorytm rozmieszczania elementów opisuje [specyfikacja W3C z 1 marca 2016 roku](https://www.w3.org/TR/2016/CR-css-flexbox-1-20160301/).

Tym wpisem zamykam serię. Właściwość `float` może teraz wrócić do tego, do czego powstała, czyli do opływania obrazków tekstem.
