# shop-api

Back-end do kursu **Angular Signals & State**.
Express 5 · TypeScript · Drizzle ORM · SQLite (libsql) · zod · bcrypt · ciasteczka sesyjne

- Przygotowanie komputera do całego kursu: [../RUNBOOK.md](../RUNBOOK.md)

## Szybki start

```bash
pnpm install
pnpm dev            # http://localhost:3000/api (pierwsze uruchomienie tworzy i wypełnia data/shop.db)
```

Użytkownicy demo (hasło dla wszystkich: `Shop!2026`):

| Email                                         | Rola          | Co może                                                   |
| --------------------------------------------- | ------------- | --------------------------------------------------------- |
| anna@shop.test                                | admin         | wszystko oprócz kupowania; użytkownicy                    |
| tomek@shop.test                               | stock-manager | dodawanie/edycja produktów, stany, wysyłka/anulowanie zamówień |
| jan@shop.test, ola@shop.test, kasia@shop.test | buyer         | kupowanie, podgląd i anulowanie własnych zamówień         |

Artykuły (poradniki zakupowe właściciela sklepu) są **tylko do odczytu**: pochodzą z seeda i
zmieniają się razem z wydaniem, więc frontend może je prerenderować (SSG). Brak API do edycji.

## Skrypty

| Skrypt                                         | Co robi                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Uruchomienie z przeładowaniem (tsx watch)                                                                |
| `pnpm build` / `pnpm start`                    | Kompilacja do `dist/` / uruchomienie skompilowanej wersji                                                |
| `pnpm test`                                    | Testy integracyjne (Vitest + supertest, osobna tymczasowa baza na plik)                                  |
| `pnpm db:reset`                                | Usunięcie bazy → migracje → seed (najpierw zatrzymaj `dev`; albo `POST /api/dev/reset`, gdy działa)      |
| `pnpm db:seed`                                 | Wyczyszczenie danych + seed (plik bazy zostaje)                                                          |
| `pnpm db:generate`                             | Nowa migracja po zmianie `src/db/schema/*`                                                               |
| `pnpm db:migrate`                              | Zastosowanie migracji                                                                                    |
| `pnpm db:studio`                               | Podgląd surowych danych (Drizzle Studio): otwórz https://local.drizzle.studio; działa, gdy `dev` chodzi  |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Jakość kodu                                                                                              |

## Konfiguracja (`.env`, opcjonalnie, zobacz `.env.example`)

| Zmienna             | Domyślnie                                         |
| ------------------- | ------------------------------------------------- |
| `PORT`              | `3000`                                            |
| `DB_URL`            | `file:./data/shop.db`                             |
| `DEV_TOOLS`         | `true` (zawsze wyłączone przy `NODE_ENV=production`) |
| `SESSION_TTL_HOURS` | `168`                                             |
| `COOKIE_SECURE`     | `false` (ustaw `true` za HTTPS)                   |

## Dane startowe (seed)

`seed/db.json`: w stylu json-server, jedna tablica na tabelę, rekordy powiązane kluczami naturalnymi
(email, sku, slug, numer zamówienia). Loader (`src/db/seed.ts`) waliduje je zodem i
zamienia klucze na id. Te same dane na każdym komputerze.

## Połączenie z Angularem

Użyj proxy dev-servera Angulara, żeby przeglądarka wołała `/api` na własnym originie (bez CORS,
ciasteczko działa jako first-party):

```json
// proxy.conf.json
{ "/api": { "target": "http://localhost:3000", "secure": false } }
```
