---
title: Shopping Manager - jadłospis, produkt, przepis
date: 2017-03-26T14:32:25.000Z
tags: ['shopping manager', 'go']
---

Do usystematyzowania pracy nad projektem **Shopping Manager**, należy w tym momencie sprecyzować, jak będą wyglądać kluczowe elementy naszego systemu. W tym krótkim wpisie zastanowię się, jakie pola powinien mieć jadłospis, produkt oraz przepis.

## Planowanie

Aplikacja Shopping Manager powinna pozwolić użytkownikowi na określenie budżetu tygodniowego. Na tej podstawie powinien być generowany jadłospis. Jadłospis zawiera zbiór przepisów, a każdy przepis zawiera listę produktów potrzebnych do jego sporządzenia.

### Jadłospis - Menu

Tutaj sytuacja jest najprostsza. Jak wspomniałem wyżej, jadłospis to zbiór przepisów. W jadłospisie kluczowe pola to `id`, `date` oraz `recipes`.

```go
package menu

import (
  "time"

  "gopkg.in/mgo.v2/bson"

  "../recipe"
)

type Menu struct {
  ID      bson.ObjectId  `json:"id" bson:"_id"`
  Date    time.Time      `json:"date"`
  Recipes recipe.Recipes `json:"recipes"`
}
```

### Przepis - Recipe

Budując przepis, miałem sporo wątpliwości, jak powinna wyglądać jego struktura. Naturalne wydało się, by przepis zawierał listę produktów, ale oprócz tego powinien mieć informację, ile poszczególnych produktów powinno się użyć. Sposób przyrządzenia dania to kolejna zagwozdka. Poszedłem na spore uproszczenia w tym temacie.

Pole sposób przyrządzenia to zwykły `string`.

#### Składnik - Ingredient

Zamiast produktu stworzymy nowy byt o nazwie składnik (`ingredient`), który będzie mieć informację o produkcie oraz dodatkowo będzie posiadać informację o jednostce miary oraz ilości potrzebnej do skomponowania przepisu.

```go
package recipe

import (
  "gopkg.in/mgo.v2/bson"

  "../ingredient"
)

// Recipe represents information about a recipe
type Recipe struct {
  ID          bson.ObjectId `json:"id" bson:"_id"`
  Name        string        `json:"name"`
  Description string        `json:"description"`

  Ingredients ingredient.Ingredients `json:"ingredients"`
}

// Recipes represent information about a recipe list
type Recipes []Recipe
```

### Produkt - Product

Produkt to rdzeń naszego systemu. Jakie pola będzie posiadać, będę weryfikować na bieżąco. Na ten moment na pewno będzie `id`, nazwa produktu (`name`), nazwa producenta (`manufacturer`), kod kreskowy (`ean`), wartość energetyczna (`energy`), masa netto (`net_weight`) oraz jednostka miary (`unit_of_measure`).

Dodatkowo będziemy zbierać informacje o cenie w postaci kolekcji.

```go
package product

import (
  "time"

  "gopkg.in/mgo.v2/bson"
)

// Product represents information about a product
type Product struct {
  ID            bson.ObjectId `json:"id" bson:"_id"`
  Name          string
  Manufacturer  string
  Ean           string
  Energy        string
  NetWeight     string
  UnitOfMeasure string
  Price         Prices
}

// Products represent information about a product list
type Products []Product

type Price struct {
  Date  time.Time `json:"date"`
  Value float32
}

type Prices []Price
```

## Podsumowanie

Przygotowana struktura pozwoli spełnić minimalne założenia projektu. Niewątpliwym plusem jest wybór MongoDB, który zapewnia mi komfort w tym temacie i oferuje mi sporą elastyczność w ewentualnej rozbudowie. Ma to również swoje minusy, ale jak zawsze, myślmy pozytywnie.
