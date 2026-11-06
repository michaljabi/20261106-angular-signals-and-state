import bcrypt from 'bcryptjs';

/** bcrypt cost factor. 10 ≈ 50–100 ms per hash in pure JS: fine for a demo, raise in production. */
const COST = 10;

export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/**
 * Used when the email does not exist, so a failed login takes the same time
 * either way (no "this email exists" timing leak).
 */
export const DUMMY_HASH = bcrypt.hashSync('dummy-password', COST);
