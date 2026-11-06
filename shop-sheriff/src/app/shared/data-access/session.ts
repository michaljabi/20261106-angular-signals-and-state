import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Role, User } from './user.model';

/**
 * Who is logged in. The real session is the httpOnly `sid` cookie (JS cannot read it);
 * this store only mirrors `GET /api/auth/me`.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly http = inject(HttpClient);
  private readonly _user = signal<User | null>(null);
  private loaded: Promise<User | null> | null = null;

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  hasRole(...roles: Role[]): boolean {
    const role = this.role();
    return role !== null && roles.includes(role);
  }

  /** Loads the session once (cookie → user). 401 = not logged in. */
  ensureLoaded(): Promise<User | null> {
    this.loaded ??= firstValueFrom(this.http.get<User>('/api/auth/me')).then(
      (user) => this.setUser(user),
      (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) return this.setUser(null);
        this.loaded = null; // network error: try again next time
        throw error;
      },
    );
    return this.loaded;
  }

  async login(email: string, password: string): Promise<User> {
    const user = await firstValueFrom(this.http.post<User>('/api/auth/login', { email, password }));
    this.loaded = Promise.resolve(this.setUser(user));
    return user;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<void>('/api/auth/logout', null));
    this.loaded = Promise.resolve(this.setUser(null));
  }

  private setUser(user: User | null): User | null {
    this._user.set(user);
    return user;
  }
}
