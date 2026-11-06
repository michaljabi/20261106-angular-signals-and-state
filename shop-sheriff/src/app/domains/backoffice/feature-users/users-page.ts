import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Role, Session, User } from '../../../shared/data-access';
import { PageHeader, Pager, ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';
import { ROLES, UsersApi } from '../data-access';
import { FilterOption, FilterPills } from '../ui';

const PAGE_SIZE = 10;

type RoleFilter = Role | 'all';

const ROLE_OPTIONS: readonly FilterOption<RoleFilter>[] = [
  { value: 'all', label: 'All' },
  ...ROLES.map((role) => ({ value: role, label: role })),
];

@Component({
  selector: 'app-users-page',
  imports: [FilterPills, PageHeader, Pager, ProblemAlert],
  templateUrl: './users-page.html',
})
export class UsersPage {
  private readonly api = inject(UsersApi);
  private readonly session = inject(Session);

  protected readonly roles = ROLES;
  protected readonly roleOptions = ROLE_OPTIONS;

  // ── UI state ──
  protected readonly role = signal<RoleFilter>('all');
  protected readonly page = linkedSignal({ source: this.role, computation: () => 1 });
  protected readonly busyId = signal<string | null>(null);
  protected readonly actionProblem = signal<ProblemDetails | null>(null);

  // ── Server state ──
  protected readonly users = this.api.list(() => {
    const role = this.role();
    return { role: role === 'all' ? null : role, page: this.page(), pageSize: PAGE_SIZE };
  });
  protected readonly loadProblem = computed(() => {
    const error = this.users.error();
    return error ? toProblem(error) : null;
  });

  /** UX guard only (no admin lock-out). The API refuses it too (409). */
  protected isMe(user: User): boolean {
    return user.id === this.session.user()?.id;
  }

  protected async changeRole(user: User, select: HTMLSelectElement): Promise<void> {
    // DOM gives a string; find the typed Role instead of casting.
    const role = ROLES.find((r) => r === select.value);
    if (!role) return;
    const ok = await this.run(user, () => this.api.changeRole(user.id, role));
    // Failed → the <select> already shows the new role; put the real one back.
    if (!ok) select.value = user.role;
  }

  protected async remove(user: User): Promise<void> {
    if (!confirm(`Delete ${user.name} (${user.email})? Their orders stay.`)) return;
    await this.run(user, () => this.api.remove(user.id));
  }

  /** Pessimistic: wait for the API, then re-fetch (the user may leave the current filter). */
  private async run(user: User, action: () => Promise<unknown>): Promise<boolean> {
    this.busyId.set(user.id);
    this.actionProblem.set(null);
    try {
      await action();
      this.users.reload();
      return true;
    } catch (error) {
      this.actionProblem.set(toProblem(error));
      return false;
    } finally {
      this.busyId.set(null);
    }
  }
}
