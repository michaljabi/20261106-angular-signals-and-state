/** Roles this UI uses. (shop-api also knows 'writer'; articles here are the shop owner's.) */
export type Role = 'buyer' | 'stock-manager' | 'admin';

/** Logged-in user (`GET /api/auth/me`). `id` is the public UUID. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}
