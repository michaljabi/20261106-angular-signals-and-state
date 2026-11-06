import { ProblemDetails } from '../../../shared/util';
import { StockConflict } from './checkout.models';

/**
 * Reads the extra fields of a 409 "Not enough stock" problem.
 * Other problems (400, 401, network…) → null: the caller shows them as a plain error.
 */
export function toStockConflict(problem: ProblemDetails): StockConflict | null {
  const { productId, sku, requested, available } = problem;
  if (
    problem.status !== 409 ||
    typeof productId !== 'string' ||
    typeof sku !== 'string' ||
    typeof requested !== 'number' ||
    typeof available !== 'number'
  ) {
    return null;
  }
  return { productId, sku, requested, available };
}
