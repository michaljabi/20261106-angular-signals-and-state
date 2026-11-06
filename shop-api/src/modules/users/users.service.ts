import type { Role } from '../../db/schema/index.js';
import type { AuthUser } from '../../shared/context.js';
import { ConflictError, NotFoundError } from '../../shared/errors.js';
import type { Page } from '../../shared/pagination.js';
import { toUserDto, type UserDto } from './users.mapper.js';
import type { UsersRepository } from './users.repository.js';
import type { UsersQuery } from './users.schemas.js';

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async list(query: UsersQuery): Promise<Page<UserDto>> {
    const { items, total } = await this.repo.list(query);
    return { items: items.map(toUserDto), total, page: query.page, pageSize: query.pageSize };
  }

  async changeRole(actor: AuthUser, userId: string, role: Role): Promise<UserDto> {
    const user = await this.getOrThrow(userId);
    if (user.id === actor.id) {
      throw new ConflictError('You cannot change your own role.');
    }
    await this.repo.updateRole(user.id, role);
    return toUserDto({ ...user, role });
  }

  async remove(actor: AuthUser, userId: string): Promise<void> {
    const user = await this.getOrThrow(userId);
    if (user.id === actor.id) {
      throw new ConflictError('You cannot delete yourself.');
    }
    await this.repo.softDelete(user.id);
  }

  private async getOrThrow(uuid: string) {
    const user = await this.repo.findActiveByUuid(uuid);
    if (!user) throw new NotFoundError('User');
    return user;
  }
}
