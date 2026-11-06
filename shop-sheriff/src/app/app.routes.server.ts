import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Render mode per route: Client, Server or Prerender.
 * Same path syntax as the router (`:slug`, `**`); first match wins.
 *
 * TODO (Day 1, task 4): today every page renders in the browser only.
 */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Client }];
