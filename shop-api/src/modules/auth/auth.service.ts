import { createHash, randomBytes } from 'node:crypto';
import type { AuthUser } from '../../shared/context.js';
import { UnauthorizedError } from '../../shared/errors.js';
import { DUMMY_HASH, verifyPassword } from '../../shared/password.js';
import type { AuthRepository } from './auth.repository.js';

/** Only the hash of the session token is stored, so a leaked DB does not leak live sessions. */
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly sessionTtlMs: number,
  ) {}

  async login(email: string, password: string) {
    const user = await this.repo.findActiveUserByEmail(email.toLowerCase());
    // Always run bcrypt, so "unknown email" and "wrong password" take the same time.
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) {
      throw new UnauthorizedError('Wrong email or password.');
    }
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);
    await this.repo.createSession(user.id, hashToken(token), expiresAt);
    return { user, token, expiresAt };
  }

  async userForToken(token: string): Promise<AuthUser | undefined> {
    return this.repo.findUserBySession(hashToken(token), new Date());
  }

  async logout(token: string): Promise<void> {
    await this.repo.deleteSession(hashToken(token));
  }
}
