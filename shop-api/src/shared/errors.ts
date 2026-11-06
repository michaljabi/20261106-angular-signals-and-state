/**
 * Domain/HTTP errors. Services throw these; the error handler turns them into
 * RFC 9457 problem+json responses. Services never touch `res`.
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    detail?: string,
    readonly extra?: Record<string, unknown>,
  ) {
    super(detail ?? title);
  }
}

export class BadRequestError extends AppError {
  constructor(detail?: string, extra?: Record<string, unknown>) {
    super(400, 'Bad Request', detail, extra);
  }
}

export class UnauthorizedError extends AppError {
  constructor(detail = 'Login required.') {
    super(401, 'Unauthorized', detail);
  }
}

export class ForbiddenError extends AppError {
  constructor(detail = 'You do not have permission to do this.') {
    super(403, 'Forbidden', detail);
  }
}

export class NotFoundError extends AppError {
  constructor(what: string) {
    super(404, 'Not Found', `${what} not found.`);
  }
}

export class ConflictError extends AppError {
  constructor(detail: string, extra?: Record<string, unknown>) {
    super(409, 'Conflict', detail, extra);
  }
}
