import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { request as httpRequest } from 'node:http';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const apiOrigin = new URL(process.env['API_ORIGIN'] ?? 'http://localhost:3000');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * /api → shop-api (same origin for the browser: cookies work, no CORS).
 * Plain stream piping, so SSE (/api/events) works too.
 * In `ng serve` the dev proxy (proxy.conf.json) does this job instead.
 */
app.use('/api', (req, res) => {
  const upstream = httpRequest(
    {
      protocol: apiOrigin.protocol,
      hostname: apiOrigin.hostname,
      port: apiOrigin.port,
      method: req.method,
      path: req.originalUrl,
      headers: { ...req.headers, host: apiOrigin.host },
    },
    (apiRes) => {
      res.writeHead(apiRes.statusCode ?? 502, apiRes.headers);
      apiRes.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) res.status(502).json({ title: 'API unreachable', status: 502 });
  });
  req.pipe(upstream);
});

/** Static files from /browser. */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/** Everything else: render the Angular app. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/** Used by the Angular CLI (dev server and build). */
export const reqHandler = createNodeRequestHandler(app);
