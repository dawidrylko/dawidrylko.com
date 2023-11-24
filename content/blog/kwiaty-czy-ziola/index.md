---
title: Kwiaty czy zioła?
date: '2023-11-17T00:00:00+00:00'
description: Rozwiązanie problemu programowania liniowego z maksymalizacją liniowej funkcji celu w kontekście uprawy kwiatów i ziół. Przedstawiiono kroki pozwalające na rozwiązanie zadania, wykorzystując matematyczną optymalizację. Problem został rozwiązany przy użyciu narzędzia CLP z pakietu OR-Tools od Google.
---

Problem programowania liniowego z maksymalizacją liniowej funkcji celu jest matematycznym zadaniem optymalizacyjnym, w którym celem jest znalezienie optymalnych wartości zmiennych decyzyjnych, tak aby zwiększyć lub osiągnąć maksymalną wartość określonej liniowej funkcji celu. W tym kontekście, optymalizuje się alokację zasobów, by osiągnąć najlepsze możliwe wyniki, jednocześnie spełniając liniowe ograniczenia związane z danym problemem.

## Problem

Rolnik dysponuje obszarem o powierzchni 100 hektarów, na którym planuje uprawiać kwiaty i zioła wykorzystywane do produkcji kosmetyków. W sezonie każdy hektar ziół wymaga 4 godzin pracy i 60 zł kapitału, natomiast każdy hektar kwiatów wymaga 16 godzin pracy i 120 zł kapitału. W ciągu sezonu rolnik chce przepracować maksymalnie 800 godzin oraz dysponuje kapitałem w wysokości 74000 zł. Zysk z hektara ziół wynosi 240 zł, a z kwiatów 300 zł. Jakie ilości hektarów ziół i kwiatów powinien uprawiać, aby maksymalizować zysk?

## Rozwiązanie

W celu rozwiązania zadania, można sformułować problem jako zadanie optymalizacyjne.

Wpierw wypiszmy **założenia** (zmienne), które będziemy rozpatrywać:

$x$ - ilość hektarów, na których uprawiane są zioła

$y$ - ilość hektarów, na których uprawiane są kwiaty

Teraz można przejść do opisu problemu.

**Maksymalizujemy funkcję zysku**:

$
Z(x, y) = 240x + 300y
$

**Dodajemy ograniczenia**:

$4x + 16y \leq 800$ - ograniczenie ilości godzin pracy

$60x + 120y \leq 74000$ - ograniczenie kapitału

**Ograniczenia dodatkowe**:

$x \geq 0$ - ilość hektarów, na których uprawiane są zioła nie może być ujemna

$y \geq 0$ - ilość hektarów, na których uprawiane są kwiaty nie może być ujemna

### Rozwiązanie matematyczne

$4x + 16y \leq 800$

$60x + 120y \leq 74000$

$x \geq 0$

$y \geq 0$

Rozwiązaniem jest układ nierówności. Rozwiązując ten układ nierówności, możemy znaleźć optymalne wartości $x$ i $y$.

### Rozwiązanie programistyczne

Czas na konkrety. Jakie wartości kryją się pod $x$ i $y$?

Do rozwiązania powyższego problemu możemy użyć darmowego roziązania **CLP**, z pakietu **OR-Tools** od **Google**.

> Route. Schedule. Plan. Assign. Pack. Solve.

```python
from ortools.linear_solver import pywraplp


def main():
    solver = pywraplp.Solver.CreateSolver("CLP")
    if not solver:
        return

    x = solver.NumVar(0, 100, "Herbs")
    y = solver.NumVar(0, 100, "Flowers")

    print("Number of variables =", solver.NumVariables())

    solver.Add(x + y <= 100)
    solver.Add(4 * x + 16 * y <= 800)
    solver.Add(60 * x + 120 * y <= 74000)

    print("Number of constraints =", solver.NumConstraints())

    solver.Maximize(240 * x + 300 * y)

    print(f"Solving with {solver.SolverVersion()}")
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        print("Solution:")
        print("Max profit =", solver.Objective().Value())
        print("Area for growing herbs =", x.solution_value())
        print("Area for growing flowers =", y.solution_value())
    else:
        print("The problem does not have an optimal solution.")


if __name__ == "__main__":
    main()
```

Wynik w konsoli:

```vim
Number of variables = 2
Number of constraints = 3
Solving with Clp 1.17.7
Solution:
Max profit = 26000.0
Area for growing herbs = 66.66666666666666
Area for growing flowers = 33.333333333333336
```

Może nie piękne, ale praktyczne. Sami o sobie piszą tak:

> OR-Tools to pakiet oprogramowania typu open source do optymalizacji zaprojektowany w celu rozwiązania najtrudniejszych na świecie problemów z routingiem, przebiegami, programowaniem liczb całkowitych i liniowych oraz programowaniem ograniczeń.

## Przydatne linki

- [ortools.linear_solver.pywraplp](https://or-tools.github.io/docs/pdoc/ortools/linear_solver/pywraplp.html#Solver.CLP_LINEAR_PROGRAMMING)
