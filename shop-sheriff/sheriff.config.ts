import { SheriffConfig, sameTag } from '@softarc/sheriff-core';

/**
 * Każdy folder poniżej to moduł. Jego publiczne API to index.ts.
 * Każdy moduł dostaje dwa tagi: do jakiej domeny należy i jakiego jest typu.
 *
 * Domeny wynikają ze ścieżek użytkownika (nie z modułów API):
 *   catalog (przeglądanie) · checkout (koszyk, moje zamówienia) · account (logowanie) · backoffice (obsługa sklepu)
 */
export const config: SheriffConfig = {
  // Punkt startowy: Sheriff idzie po importach od main.ts i tak buduje graf zależności.
  entryFile: 'src/main.ts',

  modules: {
    // Domeny biznesowe. <domain> to placeholder: nazwa folderu staje się tagiem, np. domains/catalog → domain:catalog.
    'src/app/domains/<domain>': {
      'feature-<name>': ['domain:<domain>', 'type:feature'], // Feature = strona/ekran (smart, routes). Np. feature-browse → type:feature.
      'data-access': ['domain:<domain>', 'type:data-access'], // Dostęp do danych: API, resource'y, store'y domeny.
      ui: ['domain:<domain>', 'type:ui'], // Komponenty prezentacyjne: tylko input()/output(), bez wstrzykiwania serwisów.
      util: ['domain:<domain>', 'type:util'], // Modele, typy, czyste funkcje pomocnicze. Bez stanu i bez wstrzykiwania.
    },
    // Wspólne dla całej aplikacji. Folder = typ, np. shared/ui → domain:shared + type:ui.
    'src/app/shared/<type>': ['domain:shared', 'type:<type>'],
  },

  // Reguły zależności: "moduł z tagiem X może importować moduły z tagami ...".
  // Import jest dozwolony tylko, gdy przechodzi WSZYSTKIE pasujące reguły (domeny i typu).
  depRules: {
    // root = pliki poza modułami (main.ts, app.ts, app.routes.ts). Shell ładuje feature'y
    // i używa data-access (np. licznik w navbarze).
    root: ['type:feature', 'type:data-access', 'domain:shared'],

    'domain:*': [sameTag, 'domain:shared'], // Reguły domen: domena używa siebie samej i shared...
    'domain:catalog': ['domain:checkout'], // ...z jednym świadomym wyjątkiem: catalog może użyć koszyka.

    // Reguły typów (warstwy). Zależności idą tylko "w dół": feature → ui/data-access → util.
    // Feature składa stronę: komponenty ui + dane z data-access + util. Feature nie importuje innego feature'a.
    'type:feature': ['type:ui', 'type:data-access', 'type:util'],
    'type:ui': ['type:ui', 'type:util'], // UI zna tylko inne ui i util. Nie sięga po dane (to jest błąd z t1).
    'type:data-access': ['type:data-access', 'type:util'], // Data-access zna inne data-access (np. auth) i util. Nie zna ui ani feature'ów.
    'type:util': ['type:util'], // Util- tylko inne util.
  },
};
