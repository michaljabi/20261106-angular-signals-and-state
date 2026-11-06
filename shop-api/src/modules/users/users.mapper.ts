import type { Role } from '../../db/schema/index.js';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** DB row → API shape. The internal int id never leaves the API; `uuid` becomes `id`. */
export const toUserDto = (u: {
  uuid: string;
  email: string;
  name: string;
  role: Role;
}): UserDto => ({
  id: u.uuid,
  email: u.email,
  name: u.name,
  role: u.role,
});

/** Short form used inside other resources (e.g. order buyer). */
export interface UserRefDto {
  id: string;
  name: string;
}

export const toUserRef = (u: { uuid: string; name: string }): UserRefDto => ({
  id: u.uuid,
  name: u.name,
});
