import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Role, User } from '../../../shared/data-access';
import { Page } from '../../../shared/util';

export const ROLES: readonly Role[] = ['buyer', 'stock-manager', 'admin'];

export interface UsersQuery {
  /** `null` = all roles. */
  role: Role | null;
  page: number;
  pageSize: number;
}

/** User administration (admin only). Same `User` shape as the session. */
@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);

  /** Call in an injection context. Re-fetches when `query()` changes. */
  list(query: () => UsersQuery): HttpResourceRef<Page<User> | undefined> {
    return httpResource<Page<User>>(() => {
      const { role, page, pageSize } = query();
      return { url: '/api/users', params: { page, pageSize, ...(role ? { role } : {}) } };
    });
  }

  /** 409 when you try to change your own role (no admin lock-out). */
  changeRole(id: string, role: Role): Promise<User> {
    return firstValueFrom(this.http.patch<User>(`/api/users/${id}/role`, { role }));
  }

  /** Soft delete: the user's sessions end, their orders stay. 409 for yourself. */
  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/users/${id}`));
  }
}
