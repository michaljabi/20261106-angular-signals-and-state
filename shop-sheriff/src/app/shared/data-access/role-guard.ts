import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from './session';
import { Role } from './user.model';

/** The first page each role sees after login. */
export function homeFor(role: Role): string {
  switch (role) {
    case 'buyer':
      return '/';
    case 'stock-manager':
      return '/backoffice/stock';
    case 'admin':
      return '/backoffice/orders';
    default:
      return '/'; // e.g. a 'writer' account from the API seed: not used in this UI
  }
}

/**
 * Route only for the given roles.
 * Not logged in → /login?returnUrl=…; wrong role → that role's home page.
 * UX only: the API checks permissions again (401/403).
 */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return async (_route, state) => {
    const session = inject(Session);
    const router = inject(Router);
    const user = await session.ensureLoaded();
    if (!user) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    return roles.includes(user.role) || router.parseUrl(homeFor(user.role));
  };
}
