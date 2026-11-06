# RUNBOOK: przygotowanie do szkolenia

> Zadanie #0 - rozgrzewka

## 1. Node.js

- Wspierane: **Node 22, 24 lub 26** (zalecany: **26 LTS**).

## 2. pnpm (jedna linia)

```bash
npm i -g pnpm
pnpm --version
```

Instaluje się tylko dla Twojego użytkownika (bez uprawnień administratora). Wszystkie projekty kursu używają pnpm:
wspólne paczki pobierają się **raz** i są linkowane do każdego projektu, więc instalacja
kilku aplikacji Angular jest szybka i zajmuje mało miejsca na dysku.

> Jeśli pnpm pokaże *"Ignored build scripts"*: `pnpm-workspace.yaml` projektu już określa,
> co może się uruchomić (`allowBuilds`). Nic więcej nie trzeba robić.

## 3. VS Code: rozszerzenia z `live-theory`

Lista potrzebnych rozszerzeń jest w `live-theory/.vscode/extensions.json`.
VS Code czyta ten plik **tylko z folderu otwartego jako główny**, więc otwórz `live-theory` jako osobny projekt
(nie cały folder `workspace/`).

1. Otwórz projekt w nowym oknie:
   - menu **File → Open Folder…** → wybierz folder `live-theory`, albo
   - w terminalu: `code live-theory`
2. Gdy VS Code zapyta *„Do you trust the authors of the files in this folder?”*, kliknij **Yes, I trust the authors**
   (w trybie ograniczonym rekomendacje się nie pokażą).
3. Zainstaluj rekomendowane rozszerzenia:
   - kliknij **Install** w powiadomieniu *„Do you want to install the recommended extensions…?”*, albo
   - otwórz widok Extensions (`Ctrl+Shift+X`), wpisz w wyszukiwarce `@recommended` i w sekcji
     **Workspace Recommendations** kliknij ikonę chmurki **Install Workspace Recommended Extensions**
     (instaluje wszystkie naraz).
4. Sprawdź: po wpisaniu `@recommended` żadne rozszerzenie z sekcji **Workspace Recommendations** nie ma już przycisku **Install**.

> `shop-sheriff` i `sheriff-starter` mają własne `.vscode/extensions.json`.
> Gdy otworzysz je jako osobne projekty, działa to tak samo.

## 4. Projekty

| Folder | Co to | Start |
|---|---|---|
| `shop-api/` | Back-end (Express + SQLite) | `pnpm install` → `pnpm dev` → http://localhost:3000/api |
| _Aplikacje Angular_ | `sheriff-starter` + `shop-sheriff` | `pnpm install` → `pnpm start` |

Najpierw uruchom `shop-api`. Aplikacje Angular łączą się z nim przez dev proxy (`/api`).

## 5. Sprawdź, czy API działa

```bash
cd shop-api
pnpm install
pnpm dev
```

Otwórz http://localhost:3000/api/products: powinien pojawić się JSON.

Żeby przeklikać API: otwórz `shop-api/http/*.http` w VS Code z rozszerzeniem REST Client (`humao.rest-client`).
Żeby zobaczyć surowe dane: `pnpm db:studio` w `shop-api`, potem otwórz https://local.drizzle.studio (wymaga internetu).

## 6. Reset danych

- API działa: `POST http://localhost:3000/api/dev/reset`
- API zatrzymane: `pnpm db:reset`

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---|---|
| `EADDRINUSE :3000` | Działa już inne API. Zatrzymaj je albo ustaw `PORT=3001` w `shop-api/.env`. |
| `code: command not found` | Użyj **File → Open Folder…**.  |
| `pnpm: command not found` | Otwórz **nowy** terminal po `npm i -g pnpm`. |
| Logowanie działa, ale `/auth/me` zwraca 401 | Wołaj API przez proxy Angulara (ten sam origin), żeby ciasteczko zostało wysłane. |
| Baza wygląda na zepsutą | Zatrzymaj API, `pnpm db:reset`. |
