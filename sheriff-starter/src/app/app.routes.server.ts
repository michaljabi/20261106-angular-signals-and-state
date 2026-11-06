import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * SSR stays configured (same setup as our other projects), but this exercise is about Sheriff,
 * so every route renders in the browser: the relative `/api` URLs only work through the dev proxy.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
