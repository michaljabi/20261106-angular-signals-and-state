import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Role } from '../../db/schema/index.js';
import type { AuthUser } from '../context.js';
import { ForbiddenError, UnauthorizedError } from '../errors.js';

/** 401 when nobody is logged in. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  next();
};

/** 401 when nobody is logged in, 403 when the role is not allowed. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Requires role: ${roles.join(' or ')}.`);
    }
    next();
  };
}

/** For controllers behind `requireAuth`/`requireRole`: the user is guaranteed. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}
