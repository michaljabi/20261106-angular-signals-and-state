import { HttpBackend } from '@angular/common/http';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { API_ORIGIN, ApiOriginBackend } from './shared/data-access';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // On the server there is no proxy: HTTP calls need the full API address.
    { provide: API_ORIGIN, useValue: process.env['API_ORIGIN'] ?? 'http://localhost:3000' },
    { provide: HttpBackend, useClass: ApiOriginBackend },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
