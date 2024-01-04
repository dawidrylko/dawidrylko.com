---
title: Chatbot, Wit.ai - tworzenie chatbota - Wit Node.js SDK
date: 2017-05-07T04:06:19.000Z
tags: ['wit', 'ai']
---

Dzisiaj już trzeci wpis z serii Wit.ai. Tym razem zajmiemy się tworzeniem chatbota w Node.js. Przy tej okazji zapoznamy się z **Wit Node.js SDK** i zbudujemy aplikację, która wyświetli artykuł o szukanej osobie w Wikipedii.

## Wit Node.js SDK - przygotowanie środowiska

### Instalacja

Instalacja [Wit Node.js SDK](https://github.com/wit-ai/node-wit) przebiega w standardowy sposób. Do instalacji używamy **npm**:

```javascript
npm install --save node-wit
```

Jeżeli wszystko przebiegnie pomyślnie, zostanie stworzony folder `node_modules`, a w nim znajdować się będzie zainstalowana paczka.

### Require

Możemy teraz, w głównym katalogu, stworzyć plik `index.js`. Tam z kolei dodajemy potrzebne zależności:

```javascript
const Wit = require('node-wit').Wit;
const interactive = require('node-wit').interactive;
```

W tym tutorialu skorzystamy z `Wit` oraz `interactive`, więc dodajemy tylko te zależności.

## Połączenie z Wit.ai API

### Access token

Na początku musimy pobrać **access token**. Będziemy przekazywać go jako parametr przy uruchamianiu aplikacji. Unikniemy w ten sposób zaszycia naszego tokenu w kodzie. Do wydobycia tokenu użyjemy node'owego `process`.

```javascript
const accessToken = (() => {
  if (process.argv.length !== 3) {
    process.exit(1);
  }

  return process.argv[2];
})();
```

### Tworzenie instancji Wit

Teraz możemy stworzyć nową instancję Wit. W tym celu dodajemy do naszego kodu następujące dwie linijki:

```javascript
const client = new Wit({ accessToken, actions });
interactive(client);
```

Jak widzimy powyżej, tworząc instancję Wit, przekazujemy wcześniej utworzony `accessToken`. Dopisujemy od razu `actions`, które utworzymy za chwilę.

## Akcje

Nasz **chatbot** do poprawnego działania potrzebuje jeszcze akcji. Do zapewnienia podstawowej komunikacji z Wit.ai API potrzebujemy w naszym przypadku dwóch akcji:

- `send` - wbudowana akcja Wit.ai, przyjmuje dwa parametry: request i response,
- `findPerson` - zdefiniowana przez nas akcja.

Zadeklarujmy więc akcje w naszym programie:

```javascript
const actions = {
  send(request, response) {
    console.log('request', request);
    console.log('response', response);
  },
  findPerson({ context, entities }) {
    console.log('context', context);
    console.log('entities', entities);
  },
};
```

Testując naszą aplikację, możemy zobaczyć od podszewki, w jaki sposób działa Wit.ai.

### Przykładowe wykorzystanie

Aby na tym poziomie nasz chatbot miał już jakąś funkcjonalność, sparsujemy wyodrębnione dane i sprawdzimy, czy na temat danej osoby znajduje się artykuł w Wikipedii.

Do tego celu wykorzystamy `opn`. Instalujemy paczkę przez npm.

```bash
npm install --save opn
```

Dodajemy `opn` do projektu:

```javascript
const opn = require('opn');
```

Na koniec pozostało jeszcze zmodyfikowanie metody `findPerson`:

```javascript
findPerson({ context, entities }) {
  const fullName = entities.fullName[0].value;
  const url = 'https://pl.wikipedia.org/wiki/' + fullName.replace(' ', '_');

  if (fullName) {
    context.fullName = fullName;
    opn(url, { wait: false });
  } else {
    console.error('Nie zrozumiałem.');
  }

  return context;
}
```

### Test

Pozostało nam przetestować działanie aplikacji node.js. W tym celu wykorzystamy terminal:

![Wit Node.js SDK](./Zrzut-ekranu-2017-05-07-o-15.03.59.png)

W terminalu otrzymaliśmy informację ([zadeklarowaną w poprzednim wpisie o Wit.ai](/chatbot-wit-ai-srodowisko-graficzne/)). Dodatkowo w prosty sposób sprawdzimy, czy na temat danej osoby znajduje się artykuł na Wikipedii.

![Adam Małysz wiki](./Zrzut-ekranu-2017-05-07-o-15.05.36.png)

![Dawid Ryłko wiki](./Zrzut-ekranu-2017-05-07-o-15.05.41.png)

## Podsumowanie

W tym wpisie zapoznaliśmy się z Wit Node.js SDK i zbudowaliśmy prostą aplikację w Node.js. Kolejny wpis tej serii poświęcimy na rozbudowanie naszego chatbota.

Dodatkowo cały kod z tego tutorialu do tworzenia chatbota można pobrać z [mojego repozytorium na GitHubie](https://github.com/dawidrylko/spy/tree/1.0).
