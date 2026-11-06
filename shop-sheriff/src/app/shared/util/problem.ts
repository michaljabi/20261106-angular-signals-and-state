import { HttpErrorResponse } from '@angular/common/http';

/** RFC 9457 problem details (shop-api error body). */
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Validation errors (400). */
  errors?: { path: string; message: string }[];
  /** Extra fields, e.g. 409 stock conflict: `sku`, `requested`, `available`. */
  [extra: string]: unknown;
}

/** Turns any error (usually HttpErrorResponse) into ProblemDetails. */
export function toProblem(error: unknown): ProblemDetails {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;
    if (body && typeof body === 'object' && 'title' in body) {
      return { ...(body as ProblemDetails), status: error.status };
    }
    return {
      title: error.status === 0 ? 'API unreachable' : error.statusText || 'Request failed',
      status: error.status,
    };
  }
  return { title: error instanceof Error ? error.message : 'Unknown error', status: 0 };
}
