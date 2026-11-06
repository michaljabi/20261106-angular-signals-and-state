# Sheriff Starter — Dzień 1, zadanie 2

Mały sklep: **katalog** produktów i **koszyk**. Dane z `shop-api`.
Angular 22 (SSR, zoneless, signals), pnpm, ESLint.

**Cel:** sam instalujesz Sheriffa i piszesz reguły, które ustalił **Zespół**.
Nie kopiujemy podziału `data-access / feature / ui` z `shop-sheriff`.
Reguły są proste: jeden tag na feature. Ważne dla nas jest, **jak** działa konfiguracja.

---

## Krok 0. Wymagania

- Node 26, pnpm
- działające API:

```bash
cd ../shop-api
pnpm dev            # http://localhost:3000
```

## Krok 1. Uruchom projekt

```bash
cd sheriff-starter
pnpm install
pnpm start          # http://localhost:4400
```

Dodaj kilka produktów do koszyka. Licznik w menu powinien wzrastać przy (Cart [1]) -> [2] etc...

```bash
pnpm lint
```

Wynik: zielono. Na razie nikt nie pilnuje granic między modułami.

## Krok 2. Poznaj strukturę

```
src/app/
├── app.ts, app.html, app.routes.ts   ← powłoka aplikacji (menu + trasy)
├── shared/            PricePipe (centy → "$86.99")
│   └── index.ts
└── features/
    ├── catalog/       CatalogPage (lista produktów, "Add to cart")
    │   └── index.ts
    └── cart/          CartStore (stan koszyka), CartPage
        └── index.ts
```

Każdy folder z plikiem `index.ts` to **moduł**.
`index.ts` to jego **publiczne API**. Reszta plików jest prywatna.

## Krok 3. Reguły od zespołu

Zespół ustalił:

| Moduł              | Tag               | Może importować          |
| ------------------ | ----------------- | ------------------------ |
| `features/catalog` | `feature:catalog` | `feature:cart`, `shared` |
| `features/cart`    | `feature:cart`    | `shared`                 |
| `shared`           | `shared`          | nic                      |
| root (powłoka)     | —                 | wszystko                 |

Dlaczego tak:

- Katalog ma przycisk "Add to cart", więc **zna** koszyk.
- Koszyk **nie zna** katalogu. Przyjmuje każdy obiekt, który pasuje do `CartItem`.
- `shared` to narzędzia bez wiedzy o biznesie. Nie zna żadnego feature.

## Krok 4. Zainstaluj Sheriffa

https://sheriff.softarc.io/docs/installation

```bash
pnpm add -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff
npx sheriff init
```

`init` tworzy plik `sheriff.config.ts`. Przeczytaj go. Co oznacza `noTag`? A `root`?

Dopisz w configu plik startowy (CLI Sheriffa go potrzebuje):

```ts
export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  // ...
};
```

Sprawdź, co Sheriff widzi:

```bash
npx sheriff list
```

Masz 3 moduły, wszystkie z tagiem `noTag`. Skąd Sheriff wie, że to moduły?

## Krok 5. Podłącz Sheriffa do ESLint

W `eslint.config.js`:

```js
const sheriff = require('@softarc/eslint-plugin-sheriff');
```

i nowy blok w tablicy `defineConfig([...])` (np. przed blokiem dla `**/*.html`):

https://sheriff.softarc.io/docs/installation#flat-config-eslintconfigjs

```js
  {
    files: ['**/*.ts'],
    extends: [sheriff.configs.all],
  },
```

Uruchom:

```bash
pnpm lint
```

**Pierwszy błąd!** Sheriff znalazł import "na skróty" (deep import), który był w kodzie od początku.
Napraw go: importuj przez `index.ts` modułu.
Dlaczego taki import to problem, skoro aplikacja działała?

## Krok 6. Nadaj tagi

**Tag** to etykieta modułu. Reguły z kroku 7 mówią o tagach, nie o ścieżkach.
Teraz każdy moduł ma tag `noTag`. Nadaj im tagi z tabeli z kroku 3.

Tagi nadajesz w `modules` w `sheriff.config.ts`.
Czytaj każdy wpis jak zdanie: **`'ścieżka': 'tag'` → moduł w tym folderze dostaje ten tag.**

Składnia (przykład z innego projektu):

```ts
modules: {
  'src/app/core': 'core',                 // jeden folder → jeden tag
  'src/app/domains/<domain>': 'domain:<domain>',
},
```

`<domain>` to **placeholder**. Pasuje do każdego folderu w tym miejscu, a jego nazwa trafia do tagu:

| Folder                   | Tag             |
| ------------------------ | --------------- |
| `src/app/domains/orders` | `domain:orders` |
| `src/app/domains/users`  | `domain:users`  |

Nowy folder w `domains/` dostaje tag sam, bez zmiany configu.

Sprawdź:

```bash
npx sheriff list    # tagi jak w tabeli z kroku 3?
pnpm lint
```

`pnpm lint` zgłosi teraz błąd `No dependency rule for tag ...`. To dobrze: moduły mają tagi, ale reguły z `init` znają tylko `noTag`. Naprawisz to w kroku 7.

## Krok 7. Napisz reguły zależności

https://sheriff.softarc.io/docs/dependency-rules

`init` wygenerował:

```ts
depRules: {
  'root': 'noTag',
  'noTag': 'noTag',
},
```

Czytaj każdy wpis jak zdanie: **`'A': 'B'` → moduł z tagiem A może importować moduły z tagiem B.**

- `'root': 'noTag'` → powłoka (pliki poza modułami: `app.ts`, `app.routes.ts`, `main.ts`) może importować moduły bez tagu.
- Po kroku 6 nie ma już modułów bez tagu, więc wpisy z `noTag` usuń.

Składnia (przykład z innego projektu):

```ts
depRules: {
  root: ['orders', 'users', 'core'], // kilka tagów → lista
  orders: ['users', 'core'],
  users: 'core',                     // jeden tag → string
  core: [],                          // nic → pusta lista
},
```

Przepisz tabelę z kroku 3 na `depRules`. Wpisz **każdy** tag z tabeli, także ten, który nic nie importuje.

https://sheriff.softarc.io/docs/cli

```bash
npx sheriff list
npx sheriff verify
pnpm lint           # 0 błędów
```

## Krok 8. Złam regułę celowo

Pokusa: "koszyk mógłby od razu brać `Product` z katalogu".
W `features/cart/cart-store.ts`:

```ts
import type { Product } from '../catalog';
// ...
```

```bash
pnpm lint
```

Przeczytaj komunikat. W VS Code (rozszerzenie ESLint) błąd widać od razu w edytorze.
Cofnij zmianę.

## Gotowe, gdy

- `npx sheriff list` pokazuje tagi `feature:catalog`, `feature:cart`, `shared`
- `pnpm lint` i `npx sheriff verify`: 0 błędów
- import `cart → catalog` daje błąd
- aplikacja działa jak w kroku 1

## Komendy

| Komenda              | Co robi                             |
| -------------------- | ----------------------------------- |
| `pnpm start`         | serwer dev (proxy `/api` → `:3000`) |
| `pnpm lint`          | ESLint (+ Sheriff po kroku 5)       |
| `pnpm build`         | build produkcyjny (SSR)             |
| `npx sheriff list`   | moduły i ich tagi                   |
| `npx sheriff verify` | sprawdzenie reguł bez ESLint        |
