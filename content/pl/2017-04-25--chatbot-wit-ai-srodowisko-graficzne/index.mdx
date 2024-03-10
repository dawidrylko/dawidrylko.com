---
title: Chatbot, Wit.ai - środowisko graficzne
date: 2017-04-25T19:10:58.000Z
tags: ['wit', 'ai']
---

W poprzednim wpisie dowiedzieliśmy się, czym są chatboty, do czego mogą służyć oraz było kilka słów o jednym z systemów do ich tworzenia. Dzisiaj przyjrzymy się nieco bardziej środowisku graficznemu Wit.ai oraz zaczniemy projektować prostego chatbota.

## Tworzenie aplikacji Wit.ai

Tworzenie aplikacji w **Wit.ai** jest bardzo proste i intuicyjne. W górnej belce należy kliknąć znak **+**. Zostaniemy przekierowani na stronę [wit.ai/apps/new](https://wit.ai/apps/new).

Możliwość tworzenia aplikacji dostępna jest tylko dla zalogowanych użytkowników.

Po wypełnieniu prostego formularza klikamy na przycisk `Create App`.

![Wit.ai - creating app](./Zrzut-ekranu-2017-04-25-o-18.48.52.png)

Jeżeli wszystko przebiegnie pomyślnie, stworzona dla nas zostanie nowa instancja wit. Zostaniemy przekierowani do nowej aplikacji na zakładkę `Understanding`, gdzie zostaniemy przywitani przez kota.

![Wit.ai - welcome](./Zrzut-ekranu-2017-04-25-o-19.01.51.png)

## Entity

Cała magia w tworzeniu aplikacji za pomocą Wit.ai polega na właściwym wytrenowaniu sieci. W input `User says...` wpisujemy zatem sentencję, jaką mógłby wypowiedzieć użytkownik aplikacji. Następnie oznaczamy poszczególne elementy składowe.

![Wit.ai - test sentence](./Zrzut-ekranu-2017-04-25-o-19.16.42.png)

Jak widać na obrazku załączonym powyżej, sentencja brzmi `Kim jest Johnny Depp?`. Zidentyfikowałem sobie intencję jako `find-person` oraz stworzyłem encję `fullName`, do której zostało przyporządkowane imię i nazwisko znanego aktora.

Po kliknięciu `validate` mamy możliwość wpisania kolejnej sentencji testowej. Spójrzmy jednak poniżej. Lista używanych encji zmieniła się. Nasza aplikacja wykorzystuje teraz dwie encje: `fullName` oraz `intent`. Obie zostały utworzone przez nas, a na skrajnie prawej kolumnie widać, jakie wartości kryją się za daną encją.

![Wit.ai - entity](./Zrzut-ekranu-2017-04-25-o-19.24.30.png)

### Wbudowane encje (Built-in entities)

Warto przy tej okazji nadmienić, że Wit.ai posiada szereg wbudowanych encji, które możemy wykorzystać w swojej aplikacji. **Built-in entities** mają przede wszystkim ułatwić pracę deweloperom, tak by nie musieli tworzyć najczęściej używanych encji.

> You’ll often need to extract temporal expressions, numbers, locations, temperatures, etc. To make your developer life easier, we have predefined these entities. They are trained across all our dataset, so they are supposed to perform very well.

### Strategia wyszukiwania (Search Strategy)

Jeżeli nie używamy wbudowanych encji, musimy określić **Search Strategy**. Wit.ai rozróżnia następujące strategie wyszukiwania:

- **trait** - należy wybrać tę strategię, gdy wartość encji nie wywodzi się ze słowa kluczowego lub nie jest bezpośrednią częścią składową w danej sentencji. Wykorzystujemy ten sposób wyszukiwania do określania ogólnego kontekstu lub wyczuwania intencji użytkownika.
- **free-text** - należy wybrać tę strategię, gdy chcemy wyodrębnić tekst z danej sentencji.
- **keywords** - słowa kluczowe. Wykorzystujemy dla zdefiniowanych wartości, np. kraje, waluty itp.

## Trenowanie

Nasza aplikacja zaczyna lepiej rozumieć nasze wypowiedzi, jeśli ją dobrze wytrenujemy. Zadbajmy o to, żeby wpisywane dane były różnorodne. Zmieniajmy szyk zdania oraz popełniajmy częste literówki. Pomoże to w przypadku chatbota, z którym chcemy się komunikować za pomocą tekstu.

Trenowanie w Wit.ai to żmudny proces, który niestety wymaga naszej atencji. W minimalnym stopniu, ale jednak. Gdy wprowadzimy odpowiednią ilość sentencji treningowych, możemy przejść dalej.

## Stories

Stories są na razie w fazie beta. Nic nie stoi jednak na przeszkodzie, by wykorzystać je do prostej implementacji chatbota. To swoiste dialogi pomiędzy użytkownikiem a naszą aplikacją.

Stwórzmy zatem przykładową historię, klikając `Create a story`.

![Wit.ai - story](./Zrzut-ekranu-2017-04-25-o-20.26.53.png)

Zaczynamy od wpisania sentencji użytkownika: `Kim jest Adam Małysz?` Sprawdzamy jednocześnie, czy tekst został poprawnie zinterpretowany. Następnie klikamy `Bot executes`, gdzie wpisujemy nazwę metody. W naszym przypadku ma się uruchomić metoda `findPerson()`. Jak widzimy na screenie, w metodzie są przekazywane parametry: `context` i `entities`. Następnie możemy uzupełnić `context-key`, który nie jest wymagany. Na koniec dodajemy standardową odpowiedź naszego bota do zaistniałej sytuacji.

## Test

![Wit.ai - chat button](./Zrzut-ekranu-2017-04-25-o-20.34.39.png)

Środowisko graficzne pozwala nam także szybko przetestować naszą aplikację. W prawym dolnym rogu jest przycisk rozpoczynający dialog z chatbotem.

W okienku, które wyskoczyło, możemy teraz wpisać dowolną sentencję i zaobserwować, jak do tego ustosunkuje się stworzony chatbot.

## Co dalej?

![Wit.ai - response](./Zrzut-ekranu-2017-04-25-o-20.36.51.png)

To pierwszy krok do stworzenia własnego chatbota. W tym wpisie było dużo klikania, a mało kodowania. Poprawimy to w kolejnej części serii, gdzie stworzymy od podstaw aplikację w **node.js**. Skomunikujemy się z naszą instancją Wit.ai, wyślemy sentencję użytkownika do API, zobaczymy, co nam chatbot odpowie i spróbujemy coś zrobić z danymi, które zostały wydobyte z zadanej sentencji.
