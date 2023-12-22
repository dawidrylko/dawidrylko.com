---
title: MongoDB i mgo - czyli kilka słów o bazie danych dla języka Go
date: 2017-03-09T16:39:30.200Z
tags: ['go', 'mongo']
---

Podczas projektowania aplikacji internetowych ważny jest dobór narzędzi - powinny być dostosowane do potrzeb. Nie ma sensu wprowadzać do projektu niczego na wyrost, czegoś co ma lepsze zastosowanie w innego typu projektach. Wyjątkiem od tej reguły są aplikacje tworzone dla zabicia rutyny lub szkoleniowe. **MongoDB** jest właśnie takim narzędziem. Gdyby nie konkurs [Daj Się Poznać](/daj-sie-poznac-2017-z-czym-to-sie-je/), w którym obecnie biorę udział, pewnie jeszcze długo nie znalazłbym czasu, by przetestować go w praktyce.

## Instalacja, uruchomienie MongoDB

Zainstalowanie i uruchomienie MongoDB jest bardzo proste. Przez wszystkie kroki instalacji prowadzi nas [przejrzysty tutorial](https://docs.mongodb.com/master/tutorial/install-mongodb-on-os-x/). Po zakończonej instalacji (w zależności od OS) wpisujemy komendę do uruchomienia usługi `mongod`. Jeżeli wszystko pójdzie gładko, naszym oczom powinien ukazać się komunikat podobny do tego:

```bash
2017-03-09T18:34:05.500+0100 I NETWORK [thread1] waiting for connections on port 27017
```

Nasza baza jest uruchomiona i czeka na połączenie z nią. Do testu wykorzystamy drugą konsolę. Komenda `mongo` otworzy na shella bazy danych, natomiast sama baza zakomunikuje o połączeniu do niej:

```bash
2017-03-09T18:37:42.001+0100 I NETWORK [thread1] connection accepted from 127.0.0.1:52151 #1 (1 connection now open)
```

## mgo - połączenie

W łączeniu się z bazą danych oraz w wykonywaniu operacji na niej pomoże mi biblioteka [mgo w wersji 2](https://github.com/go-mgo/mgo/tree/v2). Z zainstalowaniem pakietu przez komendę `go get gopkg.in/mgo.v2` miałem lekkie perturbacje, dlatego by nie tracić zbytnio czasu na rozwiązywanie tego problemu, pociągnąłem wersję bezpośrednio z repozytorium na GitHubie. Wyzwaniem była reorganizacja kodu. Metoda do połączenia z bazą trafiła póki co do pliku `server.go`.

```go
func getSession() *mgo.Session {
  fmt.Println("get session")
  session, error := mgo.Dial("mongodb://localhost")

  if error != nil {
    panic(error)
  }

  return session
}
```

Nie ma tutaj żadnych haczyków, korzystamy z biblioteki **mgo**, by stworzyć sesję z naszą lokalną bazą danych. W międzyczasie została dopisana metoda do tworzenia produktu (o tym będzie w osobnym wpisie), więc test w konsoli zakończył się powodzeniem:

```bash
$ curl -XPOST -H 'Content-Type: application/json' -d '{"name": "Szynka z 9 marca"}' http://localhost:8001/product
```

Wynik:

```bash
{"id":"58c19cc71c4e63572e45e3f4","name":"Szynka z 9 marca"}
```

I jeszcze z basha dla komendy `db.products.find()`:

```bash
{ "_id" : ObjectId("58c19cc71c4e63572e45e3f4"), "name" : "Szynka z 9 marca" }
```

---

#### Aktualizacja 21 grudnia 2023

Od czasu powstania tego artykułu, w Go oraz MongoDB wiele się zmieniło. Używana przeze mnie paczka `gopkg.in/mgo.v2` jest przestarzała. Obecnie zaleca się stosowanie nowszej i bardziej rozbudowanej paczki `go.mongodb.org/mongo-driver/mongo`.
