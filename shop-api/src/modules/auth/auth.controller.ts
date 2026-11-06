import type { CookieOptions, Request, Response } from 'express';
import { currentUser } from '../../shared/middleware/auth.js';
import { toUserDto } from '../users/users.mapper.js';
import { LoginBody } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

export const SESSION_COOKIE = 'sid';

/** Controller = HTTP in/out only: parse input with zod, call the service, shape the response. */
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly cookie: Pick<CookieOptions, 'secure'>,
  ) {}

  login = async (req: Request, res: Response) => {
    const body = LoginBody.parse(req.body);
    const { user, token, expiresAt } = await this.service.login(body.email, body.password);
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true, // JavaScript cannot read it → safe from XSS token theft
      sameSite: 'lax', // basic CSRF protection
      secure: this.cookie.secure,
      path: '/',
      expires: expiresAt,
    });
    res.json(toUserDto(user));
  };

  logout = async (req: Request, res: Response) => {
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token === 'string') {
      await this.service.logout(token);
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.status(204).end();
  };

  me = (req: Request, res: Response) => {
    res.json(toUserDto(currentUser(req)));
  };
}
