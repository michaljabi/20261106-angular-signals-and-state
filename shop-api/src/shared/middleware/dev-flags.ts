import type { RequestHandler } from 'express';
import { setTimeout as sleep } from 'node:timers/promises';
import { AppError } from '../errors.js';

/**
 * Dev-only query flags, to show loading and error states in the UI:
 *   ?_delay=1500  → wait 1.5 s before handling the request (max 10 s)
 *   ?_fail=503    → answer with that HTTP error status instead
 * Works on every endpoint. Mounted only when DEV_TOOLS is on.
 */
export const devFlags: RequestHandler = async (req, _res, next) => {
  const delay = Number(req.query['_delay']);
  if (Number.isFinite(delay) && delay > 0) {
    await sleep(Math.min(delay, 10_000));
  }
  const fail = Number(req.query['_fail']);
  if (Number.isInteger(fail) && fail >= 400 && fail <= 599) {
    throw new AppError(fail, 'Simulated Failure', `Simulated failure (_fail=${fail}).`);
  }
  next();
};
