---
title: Chatbot, Wit.ai - tworzenie chatbota - Speech API
date: 2017-05-17T21:03:15.000Z
tags: ['wit', 'ai']
---

Rozpoznawanie głosu to temat trudny, nawet dla największych wyjadaczy. Z pomocą przychodzi jednak **Wit.ai**, wraz ze swoim **Speech API**. Dzięki dedykowanej aplikacji oraz wykorzystaniu **WebRTC** i **WebSockets** możemy w prosty sposób przekonwertować mowę na tekst oraz skomunikować się z naszym chatbotem.

## Trochę teorii

Wit.ai Speech API powstało w lutym 2014 roku jako rozwinięcie projektu Wit.ai. Zasada działania jest prosta, przesyłamy na backend (w tym wypadku na zewnętrzny serwer Wit.ai) plik audio. Dźwięk jest przetwarzany i konwertowany. Dostajemy w zwrotce JSON z intencją oraz wartościami, które zostaną wychwycone.

![speech2json](./speech2json.png)

Wit.ai Speech API łączy w sobie różne techniki przetwarzania języka naturalnego oraz silniki rozpoznawania mowy. Potrafi odseparować szumy z otoczenia, dostosować poziom głośności i wydobyć właściwe dźwięki.

### Microphone

W ramach tego wpisu zapoznamy się z nakładką [wit-ai/microphone](https://github.com/wit-ai/microphone). Biblioteka jest rozwijana przez zespół zajmujący się Wit.ai. Została napisana w CoffeeScript, wykorzystuje WebRTC i WebSockets, dzięki czemu nie musimy zapisywać plików audio lokalnie. Cały kod jest jawny, a jego rdzeń możemy znaleźć [tutaj](https://github.com/wit-ai/microphone/blob/master/app/coffee/microphone.coffee).

## Implementacja Speech API

Po wpięciu biblioteki obsługującej mikrofon i komunikującej się z Wit.ai API, pozostało obsłużyć mikrofon na stronie internetowej.

Zaczynamy od stworzenia instancji `Microphone`:

```javascript
const microphone = new Wit.Microphone(document.getElementById('microphone'));
```

Jak widać, odwołujemy się do elementu posiadającego `id` `microphone`. W ten sam sposób dodajemy `info` oraz `error`:

```javascript
const info = message => {
  document.getElementById('info').innerHTML = message;
};
const error = message => {
  document.getElementById('error').innerHTML = message;
};
```

Teraz, korzystając z dokumentacji, stwórzmy kilka metod obsługujących naszą aplikację. Poinformujmy użytkownika, że można rozpocząć nagrywanie:

```javascript
microphone.onready = () => {
  info('Mikrofon gotowy do nagrywania');
};
```

Po starcie, zmiana statusu z informacją:

```javascript
microphone.onaudiostart = () => {
  info('Nagrywanie rozpoczęte');
};
```

Oraz po zakończeniu nagrywania:

```javascript
microphone.onaudioend = () => {
  info('Nagrywanie zakończone, trwa konwertowanie');
};
```

Pamiętajmy, że w razie niepowodzenia, warto o tym poinformować użytkownika. Wykorzystujemy więc metodę `onerror`:

```javascript
microphone.onerror = errorMessage => {
  error('Błąd: ' + errorMessage);
};
```

W momencie nawiązywania oraz zamykania połączenia mamy dwa dodatkowe callbacki: `onconnecting`, `ondisconnected`. Wykorzystujemy je do stworzenia dodatkowych statusów informujących:

```javascript
microphone.onconnecting = () => {
  info('Trwa weryfikowanie mikrofonu');
};
microphone.ondisconnected = () => {
  info('Mikrofon nie jest podłączony');
};
```

Została nam jeszcze obsługa `onresult`. Analogicznie jak w [wersji node'owej](/chatbot-wit-ai-tworzenie-chatbota-wit-node-js-sdk/), tutaj też po zidentyfikowaniu osoby, spróbujemy wyszukać o niej informacje na Wikipedii:

```javascript
microphone.onresult = (intent, entities) => {
  if (entities.fullName === undefined) {
    document.getElementById('result').innerHTML =
      'Nie zrozumiałem, spróbuj jeszcze raz!';
  } else {
    let fullName = entities.fullName.value;
    document.getElementById('result').innerHTML =
      fullName + '? Szukam na wikipedii...';
    window.open('https://pl.wikipedia.org/wiki/' + fullName.replace(' ', '_'));
  }
};
```

W metodzie connect przekazujemy token, który możemy wygenerować w ustawieniach aplikacji.

![Speech API token](./Zrzut-ekranu-2017-05-17-o-22.28.47.png)

## Podsumowanie

Po implementacji i deployu na Heroku, możemy sprawdzić, jak się zachowuje aplikacja. Przykładowy screen z testu zamieszczam poniżej. Cały kod dostępny jest na [moim GitHubie](https://github.com/dawidrylko/spy-web), zachęcam też do przetestowania aplikacji samodzielnie.

![Spy chatbot - Speech API](./Zrzut-ekranu-2017-05-17-o-22.44.56.png)

## Źródła

- [wit-ai/microphone](https://github.com/wit-ai/microphone) - dedykowana biblioteka obsługująca mikrofon w przeglądarce. Oparta na WebRTC i WebSockets.
- [wit.ai/docs/quickstart](https://wit.ai/docs/quickstart) - szybki start z Wit.ai
- ~~spy-chatbot.herokuapp.com - aplikacja wykonana w tym wpisie~~
- [github.com/dawidrylko/spy-web](https://github.com/dawidrylko/spy-web) - kod źródłowy
