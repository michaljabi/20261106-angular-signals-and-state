import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, NotFoundError } from '../errors.js';

/**
 * One place that turns errors into RFC 9457 "problem details" (application/problem+json):
 *   { type, title, status, detail, instance, errors? }
 * Express 5 forwards rejected promises from async handlers here automatically.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const problem = toProblem(err);
  if (problem.status >= 500) {
    console.error(err);
  }
  res
    .status(problem.status)
    .type('application/problem+json')
    .json({ ...problem, instance: req.originalUrl });
};

export const notFoundHandler: RequestHandler = (req) => {
  throw new NotFoundError(`Route ${req.method} ${req.path}`);
};

interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  [key: string]: unknown;
}

function toProblem(err: unknown): Problem {
  if (err instanceof ZodError) {
    return {
      type: 'about:blank',
      title: 'Validation Failed',
      status: 400,
      detail: 'The request data is not valid.',
      // Field errors in a shape a form can use: [{ path: "lines.0.quantity", message: "..." }]
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }
  if (err instanceof AppError) {
    return {
      type: 'about:blank',
      title: err.title,
      status: err.status,
      detail: err.message,
      ...err.extra,
    };
  }
  // Malformed JSON body (thrown by express.json()).
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Malformed JSON.' };
  }
  return {
    type: 'about:blank',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Something went wrong.',
  };
}
