import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'structure/by-type' },
  // Part A – App structure (evolution: by type → style guide → by feature → Sheriff)
  {
    path: 'structure',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'by-type' },
      {
        path: 'by-type',
        title: 'A1 – naiwny: wg typu',
        loadComponent: () =>
          import('./a-app-structure/a1-by-type/a1-by-type-page').then((m) => m.A1ByTypePage),
      },
      {
        path: 'style-guide',
        title: 'A2 – wg Style Guide (do v19)',
        loadComponent: () =>
          import('./a-app-structure/a2-style-guide/a2-style-guide-page').then(
            (m) => m.A2StyleGuidePage,
          ),
      },
      {
        path: 'by-feature',
        title: 'A3 – wg feature',
        loadComponent: () =>
          import('./a-app-structure/a3-by-feature/a3-by-feature-page').then(
            (m) => m.A3ByFeaturePage,
          ),
        // Mini-app routes render in the <router-outlet> inside the page's demo.
        loadChildren: () =>
          import('./a-app-structure/a3-by-feature/app/shop.routes').then((m) => m.SHOP_ROUTES),
      },
      {
        path: 'sheriff',
        title: 'A4 – pilnowany przez Sheriff',
        loadComponent: () =>
          import('./a-app-structure/a4-sheriff/a4-sheriff-page').then((m) => m.A4SheriffPage),
        loadChildren: () =>
          import('./a-app-structure/a4-sheriff/app/shop.routes').then((m) => m.SHOP_ROUTES),
      },
      {
        path: 'sheriff-config',
        title: 'A4 – konfiguracja Sheriff: podstawy',
        loadComponent: () =>
          import('./a-app-structure/a4-sheriff/a4-sheriff-config-page').then(
            (m) => m.A4SheriffConfigPage,
          ),
      },
      {
        path: 'nx',
        title: 'A5 – Nx monorepo',
        loadComponent: () => import('./a-app-structure/a5-nx/a5-nx-page').then((m) => m.A5NxPage),
        loadChildren: () =>
          import('./a-app-structure/a5-nx/apps/shop/src/app/shop.routes').then(
            (m) => m.SHOP_ROUTES,
          ),
      },
    ],
  },
  // Part B – Render modes: same client route shape, mode set per path in app.routes.server.ts
  {
    path: 'render',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'csr' },
      {
        path: 'csr',
        title: 'B1 – CSR',
        loadComponent: () => import('./b-render-modes/b1-csr-page').then((m) => m.B1CsrPage),
      },
      {
        path: 'ssr',
        title: 'B2 – SSR',
        loadComponent: () => import('./b-render-modes/b2-ssr-page').then((m) => m.B2SsrPage),
      },
      {
        path: 'ssr-hydration',
        title: 'B2 – SSR: cykl życia i hydratacja',
        loadComponent: () =>
          import('./b-render-modes/b2-ssr-hydration-page').then((m) => m.B2SsrHydrationPage),
      },
      {
        path: 'ssg',
        title: 'B3 – SSG',
        loadComponent: () => import('./b-render-modes/b3-ssg-page').then((m) => m.B3SsgPage),
      },
    ],
  },
  // Part C – Signals
  {
    // Group: signal() → /signal/<example>
    path: 'signal',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'signal() – podstawy',
        loadComponent: () =>
          import('./c-signals/components/signals-basics').then((m) => m.SignalsBasics),
      },
      {
        path: 'complex-data',
        title: 'signal() – złożone dane',
        loadComponent: () =>
          import('./c-signals/components/signal-complex-data').then((m) => m.SignalComplexData),
      },
      {
        path: 'same-reference',
        title: 'signal() – ta sama referencja',
        loadComponent: () =>
          import('./c-signals/components/signal-same-reference').then((m) => m.SignalSameReference),
      },
    ],
  },
  {
    // Group: many computed() examples → /signal-computed/<example>
    path: 'signal-computed',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'computed() – podstawy',
        loadComponent: () =>
          import('./c-signals/components/signal-computed').then((m) => m.SignalComputed),
      },
      {
        path: 'cart-total',
        title: 'computed() – suma koszyka',
        loadComponent: () =>
          import('./c-signals/components/signal-computed-cart').then((m) => m.SignalComputedCart),
      },
    ],
  },
  {
    // Group: linkedSignal() → /signal-linked/<example>
    path: 'signal-linked',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'basics' },
      {
        path: 'basics',
        title: 'linkedSignal() – reset wyboru',
        loadComponent: () =>
          import('./c-signals/components/signal-linked').then((m) => m.SignalLinked),
      },
      {
        path: 'previous',
        title: 'linkedSignal() – poprzedni wybór',
        loadComponent: () =>
          import('./c-signals/components/signal-linked-previous').then(
            (m) => m.SignalLinkedPrevious,
          ),
      },
      {
        path: 'anti-pattern',
        title: 'linkedSignal() – antywzorce',
        loadComponent: () =>
          import('./c-signals/components/signal-linked-anti-pattern').then(
            (m) => m.SignalLinkedAntiPattern,
          ),
      },
    ],
  },
  {
    // Group: effect() – good use + anti-patterns → /signal-effect/<example>
    path: 'signal-effect',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'autosave' },
      {
        path: 'autosave',
        title: 'effect() – autozapis',
        loadComponent: () =>
          import('./c-signals/components/signal-effect').then((m) => m.SignalEffect),
      },
      {
        path: 'anti-pattern-1',
        title: 'effect() – antywzorzec #1',
        loadComponent: () =>
          import('./c-signals/components/signal-effect-anti-pattern-1').then(
            (m) => m.SignalEffectAntiPattern1,
          ),
      },
      {
        path: 'anti-pattern-2',
        title: 'effect() – antywzorzec #2',
        loadComponent: () =>
          import('./c-signals/components/signal-effect-anti-pattern-2').then(
            (m) => m.SignalEffectAntiPattern2,
          ),
      },
      {
        path: 'anti-pattern-3',
        title: 'effect() – antywzorzec #3',
        loadComponent: () =>
          import('./c-signals/components/signal-effect-anti-pattern-3').then(
            (m) => m.SignalEffectAntiPattern3,
          ),
      },
    ],
  },
  {
    // Group: parent ↔ child communication → /signal-io/<example>
    path: 'signal-io',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'input' },
      {
        path: 'input',
        title: 'input() i input.required()',
        loadComponent: () =>
          import('./c-signals/components/signal-input').then((m) => m.SignalInput),
      },
      {
        path: 'output',
        title: 'output() – zdarzenia',
        loadComponent: () =>
          import('./c-signals/components/signal-output').then((m) => m.SignalOutput),
      },
    ],
  },
  {
    path: 'signal-long-distance',
    title: 'Sygnał w serwisie',
    loadComponent: () =>
      import('./c-signals/components/signal-communication-for-long-distance').then(
        (m) => m.SignalCommunicationForLongDistance,
      ),
  },
  { path: '**', redirectTo: 'structure/by-type' },
];
