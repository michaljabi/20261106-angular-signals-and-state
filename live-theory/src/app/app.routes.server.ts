import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Part B – one route per render mode (client routes are identical, see app.routes.ts)
  { path: 'render/csr', renderMode: RenderMode.Client },
  { path: 'render/ssr', renderMode: RenderMode.Server },
  { path: 'render/ssg', renderMode: RenderMode.Prerender },
  // Everything else → prerendered at build time
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
