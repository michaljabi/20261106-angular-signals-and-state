import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { sessions, users } from '../../db/schema/index.js';

export class AuthRepository {
  constructor(private readonly db: Db) {}

  findActiveUserByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: and(eq(users.email, email), isNull(users.deletedAt)),
    });
  }

  async createSession(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.db.insert(sessions).values({ userId, tokenHash, expiresAt });
  }

  /** Session → user, only if the session is not expired and the user is not deleted. */
  async findUserBySession(tokenHash: string, now: Date) {
    const [row] = await this.db
      .select({
        id: users.id,
        uuid: users.uuid,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          gt(sessions.expiresAt, now),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);
    return row;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  async deleteExpiredSessions(now: Date): Promise<void> {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, now));
  }
}
