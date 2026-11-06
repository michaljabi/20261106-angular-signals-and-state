import { Component, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Session, homeFor } from '../../../shared/data-access';
import { PageHeader, ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';

const DEMO_PASSWORD = 'Shop!2026';

/** Seed users (shop-api/seed/db.json). Demo only. */
const DEMO_USERS = [
  { email: 'anna@shop.test', name: 'Anna', role: 'admin' },
  { email: 'tomek@shop.test', name: 'Tomek', role: 'stock-manager' },
  { email: 'jan@shop.test', name: 'Jan', role: 'buyer' },
  { email: 'ola@shop.test', name: 'Ola', role: 'buyer' },
  { email: 'kasia@shop.test', name: 'Kasia', role: 'buyer' },
] as const;

@Component({
  selector: 'app-login-page',
  imports: [FormField, FormRoot, PageHeader, ProblemAlert],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  /** `?returnUrl=` from roleGuard (router input binding). */
  readonly returnUrl = input<string>();

  protected readonly demoUsers = DEMO_USERS;
  protected readonly problem = signal<ProblemDetails | null>(null);

  private readonly model = signal({ email: '', password: '' });
  protected readonly loginForm = form(
    this.model,
    (f) => {
      required(f.email, { message: 'Email is required' });
      email(f.email, { message: 'Not a valid email' });
      required(f.password, { message: 'Password is required' });
    },
    {
      submission: {
        action: async (f) => {
          const { email, password } = f().value();
          this.problem.set(null);
          try {
            const user = await this.session.login(email, password);
            await this.router.navigateByUrl(this.returnUrl() ?? homeFor(user.role));
          } catch (error) {
            this.problem.set(toProblem(error));
          }
        },
      },
    },
  );

  protected fill(email: string): void {
    this.model.set({ email, password: DEMO_PASSWORD });
  }
}
