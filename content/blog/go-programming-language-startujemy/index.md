---
title: Go Programming Language - startujemy!
date: 2017-03-05T17:14:30.200Z
tags: ['go']
---

Każdy projekt opiera się na jakichś filarach. Dlatego na samym początku przedstawię wam język **Go**, który wybrałem do tworzenia backendu mojej aplikacji **Shopping Manager**.

## Ogólny zarys języka Go

**Go** (nazywany też **Golang**) to język napisany przez pracowników Google. Pierwsza wersja języka została opublikowana w listopadzie 2009 roku. Podczas projektowania architekci wyraźnie nawiązali do tradycji języka C, starając się przy tym urzeczywistnić wizję, by język był prosty w nauce, szybki i elastyczny. W Go zasady **OOP** schodzą na dalszy plan. W skrajnych przypadkach może to prowadzić do rozleniwienia programisty, w większości jednak pozwala przyspieszyć czas dewelopmentu.

> Go is an open source programming language that makes it easy to build simple, reliable, and efficient software.

Zamysł i idea twórców przekonały również mnie. Po stworzeniu kilku pierwszych endpointów poczułem moc drzemiącą w tym niepozornym i niezbyt popularnym języku.

## Instalacja i pierwsze kroki

### Hello World

Sam proces instalacji jest bardzo prosty i szczegółowo opisany w [oficjalnym tutorialu](https://golang.org/doc/install). Wystartowanie zajmuje zaledwie kilkanaście minut i jesteśmy w stanie napisać sztandarowe "Hello World" w Golang.

```go
package main

import "fmt"

func main() {
  fmt.Println("shopping-manager api start")
}
```

Wystartowanie naszej aplikacji to odpalenie w konsoli komendy `go run hello_world.go`. Składnia jest bardzo przystępna. Na samej górze nazwa pakietu, później importy oraz funkcja główna. Prawda, że proste?

### Get method

Napisanie metody zwracającej listę produktów to kilka kolejnych linijek. Na początku deklarujemy strukturę produktu. Nasz produkt na razie składać się będzie tylko z dwóch pól: `ID` i `Name`. Jako że chcemy operować na tablicy, będziemy potrzebować drugiej struktury opisującej właśnie tablicę produktów.

```go
package main

import (
  "encoding/json"
  "fmt"
  "net/http"
)

func main() {
  fmt.Println("shopping-manager api start")
}

type Product struct {
  ID   int    `json:"id"`
  Name string `json:"name"`
}
type Products []Product

func getProducts(responseWriter http.ResponseWriter, request *http.Request) {
  products := Products{
    Product{ID: 1, Name: "ogórek zielony"},
    Product{ID: 2, Name: "papryka czerwona"},
    Product{ID: 3, Name: "Sałata lodowa"},
  }

  json.NewEncoder(responseWriter).Encode(products)
}
```

Sama metoda `getProducts` to zwykły handler RESTowy. Lista produktów jest na razie uzupełniana w tym miejscu, docelowo będzie pobierana z bazy danych. Dzięki metodzie `json.NewEncoder` możemy zwrócić dane bezpośrednio do przeglądarki.

### Serwer HTTP

Zwieńczeniem naszej pracy będzie zaprezentowanie danych na lokalnym porcie 8080. Wykorzystamy do tego pakiet `http`.

```go
func serverRun() {
  http.HandleFunc("/api/product", getProducts)

  log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Teraz po wpisaniu w konsoli `go run main.go` i wejściu na `http://localhost:8080/api/product` naszym oczom ukaże się efekt naszej pracy.

## Podsumowanie

Głównym powodem wybrania przeze mnie języka **Go** do tego projektu była prostota i możliwe jak największe przyspieszenie mojej pracy. Pierwsze kroki z **Golang** utwierdzają mnie w tym wyborze. Zdaję sobie sprawę z tego, że schody się zaczną, prędzej czy później. Technologia, którą wybrałem do swojego backendu, dopiero pokaże pazurki. Nie ma się co jednak przejmować na zapas.

Na koniec jeszcze kod w całości:

```go
package main

import (
  "encoding/json"
  "fmt"
  "log"
  "net/http"
)

func main() {
  fmt.Println("shopping-manager api start")

  serverRun()
  fmt.Println("server start")
}

type Product struct {
  ID   int    `json:"id"`
  Name string `json:"name"`
}
type Products []Product

func getProducts(responseWriter http.ResponseWriter, request *http.Request) {
  products := Products{
    Product{ID: 1, Name: "ogórek zielony"},
    Product{ID: 2, Name: "papryka czerwona"},
    Product{ID: 3, Name: "Sałata lodowa"},
  }

  json.NewEncoder(responseWriter).Encode(products)
}

func serverRun() {
  http.HandleFunc("/api/product", getProducts)

  log.Fatal(http.ListenAndServe(":8080", nil))
}
```
