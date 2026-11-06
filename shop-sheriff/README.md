# Shop Sheriff

Mały sklep w Angular 22 na prawdziwym back-endzie (`../shop-api`): katalog, koszyk i zamówienia,
back office dla obsługi oraz poradniki zakupowe właściciela sklepu (artykuły, tylko do odczytu).
Pokazuje, jak podzielić aplikację na **domeny** i **typy modułów** oraz jak
**Sheriff** sprawdza reguły przez ESLint.

- Angular 22.2: standalone, zoneless, signals, `httpResource`, Signal Forms, SSR + hydration
- Bootstrap 5.3 (tylko CSS)
- Sheriff 0.20 + ESLint (angular-eslint)
- Node.js 26 LTS (zobacz `.nvmrc`), pnpm

## Uruchomienie

```bash
# 1. API (osobny terminal)
cd ../shop-api && pnpm dev        # http://localhost:3000

# 2. Aplikacja
nvm use                           # Node 26
pnpm install
pnpm start                        # http://localhost:4200 (dev proxy: /api → :3000)
pnpm lint                         # ESLint + reguły Sheriffa
pnpm sheriff:list                 # moduły i ich tagi

# Build produkcyjny (SSR)
pnpm build && pnpm serve:ssr      # http://localhost:4000 (proxy /api → API_ORIGIN, domyślnie :3000)
```

Zaloguj się na `/login` (hasło każdego użytkownika demo to `Shop!2026`; kliknij użytkownika, żeby wypełnić formularz):

| Użytkownik      | Rola          | Co może                                                          |
| --------------- | ------------- | ---------------------------------------------------------------- |
| Anna            | admin         | Stany magazynowe, wszystkie zamówienia, użytkownicy              |
| Tomek           | stock-manager | Stany (dodawanie produktów, +/- sztuk), wszystkie zamówienia (wysyłka/anulowanie) |
| Jan, Ola, Kasia | buyer         | Koszyk, składanie zamówień, własne zamówienia (anulowanie nowych) |

Artykuły to treści właściciela sklepu: zmieniają się razem z wydaniem, więc aplikacja tylko je czyta.
(shop-api ma też rolę writer i proces moderacji. Ta aplikacja z nich nie korzysta.)

Goście (niezalogowani) mogą przeglądać produkty i czytać artykuły.
Reset danych w dowolnej chwili: `POST http://localhost:3000/api/dev/reset`.

## Tryby renderowania

`src/app/app.routes.server.ts` decyduje dla każdej trasy: Client, Server albo Prerender
(Dzień 1, zadanie 4: `docs/exercises/day1-4-render-modes.md`).

Na serwerze nie ma proxy, więc `ApiOriginBackend` (`HttpBackend` tylko po stronie serwera) wysyła `/api/...`
na pełny adres API (`API_ORIGIN`, ustawiany w `app.config.server.ts`). Backend, a nie
interceptor: działa po HTTP transfer cache, więc przeglądarka korzysta z odpowiedzi serwera.

## Struktura

Domeny wynikają ze **ścieżek użytkownika**, a nie z modułów API (zobacz `.grill/fe-vs-be-domain-split.md`).

```
src/app/
├── app.ts, app.html, app.routes.ts   ← root (shell): navbar + lazy routes
├── shared/
│   ├── data-access/   Session (logowanie ciasteczkiem), roleGuard, ServerEvents (SSE), ApiOriginBackend
│   ├── ui/            PageHeader, Pager, ProblemAlert, price pipe (centy → USD)
│   └── util/          Page<T>, ProblemDetails, toProblem()
└── domains/
    ├── catalog/       przeglądanie + strona produktu (feature-browse, feature-product, data-access, ui, util)
    ├── checkout/      koszyk + moje zamówienia       (feature-cart, feature-my-orders, data-access, ui, util)
    ├── account/       logowanie                      (feature-login)
    ├── backoffice/    obsługa: stany, zamówienia, użytkownicy (feature-*, data-access, ui, util)
    └── articles/      poradniki, tylko do odczytu    (jeszcze niepodzielone na moduły, bez tagów)
```

Każdy folder modułu ma `index.ts`. Ten plik to publiczne API modułu.
Kod spoza modułu może importować tylko z `index.ts`.

Routing działa tak samo: `app.routes.ts` (shell) odpowiada tylko za prefiks URL, guard i
`loadChildren`. Każdy feature ma własne trasy w `<feature>.routes.ts`, a jego `index.ts` eksportuje
tylko te trasy. Komponenty stron zostają prywatne.

### Co robi każdy typ

| Typ           | Zawiera                                                | Może importować       |
| ------------- | ------------------------------------------------------ | --------------------- |
| `feature-*`   | Strony (smart components), logika strony               | ui, data-access, util |
| `ui`          | Komponenty prezentacyjne, tylko `input()`/`output()`   | ui, util              |
| `data-access` | Wywołania API (`httpResource`, HttpClient), store'y    | data-access, util     |
| `util`        | Modele, zwykłe funkcje                                 | util                  |

Reguła domen: domena może importować samą siebie i `shared`.
Jeden zaplanowany wyjątek: `catalog` może używać `checkout` (przycisk „Add to cart” podczas przeglądania).

Wszystko to jest w `sheriff.config.ts`.

## Zobacz, jak Sheriff łapie błąd

Dodaj którąś z tych linii do pliku i uruchom `pnpm lint`:

```ts
// w domains/catalog/ui/product-card.ts → ui nie może używać data-access
import { CartStore } from '../../checkout/data-access';

// w domains/checkout/feature-cart/cart-page.ts → checkout nie może używać catalog
import { ProductCard } from '../../catalog/ui';

// gdziekolwiek → deep import z pominięciem index.ts
import { Session } from '../../../shared/data-access/session';
```

Dostaniesz błędy w stylu:

```
module /src/app/domains/catalog/ui cannot access /src/app/domains/checkout/data-access.
Tag type:ui has no clearance for tags domain:checkout, type:data-access
Deep import is not allowed. Use the module's index.ts or path
```
