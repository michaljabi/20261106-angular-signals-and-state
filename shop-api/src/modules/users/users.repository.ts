import { and, asc, count, eq, isNull, type SQL } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { sessions, users, type Role } from '../../db/schema/index.js';
import { offsetOf } from '../../shared/pagination.js';
import type { UsersQuery } from './users.schemas.js';

export class UsersRepository {
  constructor(private readonly db: Db) {}

  async list(query: UsersQuery) {
    const filters: SQL[] = [isNull(users.deletedAt)];
    if (query.role) filters.push(eq(users.role, query.role));
    const where = and(...filters);

    const [items, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(where)
        .orderBy(asc(users.name))
        .limit(query.pageSize)
        .offset(offsetOf(query)),
      this.db.select({ total: count() }).from(users).where(where),
    ]);
    return { items, total: totalRow?.total ?? 0 };
  }

  findActiveByUuid(uuid: string) {
    return this.db.query.users.findFirst({
      where: and(eq(users.uuid, uuid), isNull(users.deletedAt)),
    });
  }

  async updateRole(id: number, role: Role): Promise<void> {
    await this.db.update(users).set({ role }).where(eq(users.id, id));
  }

  /** Soft delete + log the user out everywhere. */
  async softDelete(id: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
      await tx.delete(sessions).where(eq(sessions.userId, id));
    });
  }
}
