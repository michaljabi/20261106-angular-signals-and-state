import { Component, inject, output, signal } from '@angular/core';
import {
  FieldTree,
  FormField,
  FormRoot,
  ReadonlyFieldTree,
  ValidationError,
  form,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  validate,
  validateHttp,
} from '@angular/forms/signals';
import { ProblemAlert } from '../../../shared/ui';
import { ProblemDetails, toProblem } from '../../../shared/util';
import { StockApi } from '../data-access';
import { Product, SkuAvailability } from '../util';

/** What the form edits. Price in dollars (people type 129.99), the API wants cents. */
interface NewProductModel {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}

const EMPTY: NewProductModel = {
  sku: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
};

/** Same rule as the API, but case-insensitive: the API upper-cases the SKU itself. */
const SKU_PATTERN = /^[A-Za-z]{2}-\d{4}$/;

const toCents = (dollars: number) => Math.round(dollars * 100);

/** Feature-internal smart component: talks to StockApi, tells the page when a product exists. */
@Component({
  selector: 'app-new-product-form',
  imports: [FormField, FormRoot, ProblemAlert],
  templateUrl: './new-product-form.html',
})
export class NewProductForm {
  private readonly api = inject(StockApi);

  readonly created = output<Product>();

  protected readonly categories = this.api.categories();
  /** Errors we cannot pin to a field (403, 500, network...). */
  protected readonly problem = signal<ProblemDetails | null>(null);

  private readonly model = signal<NewProductModel>({ ...EMPTY });
  protected readonly productForm = form(
    this.model,
    (p) => {
      required(p.sku, { message: 'SKU is required' });
      pattern(p.sku, SKU_PATTERN, { message: 'SKU looks like KB-0001' });
      // Async rule: runs only after the sync rules pass, waits 300 ms after typing,
      // and (being an httpResource) cancels the stale request when the value changes.
      validateHttp(p.sku, {
        request: ({ value }) => this.api.skuAvailableRequest(value()),
        debounce: 300,
        onSuccess: (result: SkuAvailability) =>
          result.available ? null : { kind: 'skuTaken', message: `${result.sku} is already taken` },
        // The check itself failed (network...): do not block the form, the API checks again (409).
        onError: () => null,
      });

      required(p.name, { message: 'Name is required' });
      minLength(p.name, 2, { message: 'At least 2 characters' });
      maxLength(p.name, 120, { message: 'At most 120 characters' });
      maxLength(p.description, 2000, { message: 'At most 2000 characters' });

      min(p.price, 0, { message: 'Price cannot be negative' });
      max(p.price, 100_000, { message: 'Price is too high' });
      // Custom sync rule: money has 2 decimals. (Float maths: compare with a small epsilon.)
      validate(p.price, ({ value }) =>
        Math.abs(value() * 100 - toCents(value())) > 1e-6
          ? { kind: 'cents', message: 'At most 2 decimals' }
          : null,
      );

      min(p.stock, 0, { message: 'Stock cannot be negative' });
      max(p.stock, 100_000, { message: 'Stock is too high' });
      validate(p.stock, ({ value }) =>
        Number.isInteger(value()) ? null : { kind: 'integer', message: 'Whole items only' },
      );

      required(p.categoryId, { message: 'Pick a category' });
    },
    { submission: { action: (f) => this.save(f) } },
  );

  /** Returned errors land on the fields, just like client-side validation errors. */
  private async save(
    f: FieldTree<NewProductModel>,
  ): Promise<ValidationError.WithOptionalFieldTree[]> {
    const { sku, name, description, price, stock, categoryId } = f().value();
    this.problem.set(null);
    try {
      const product = await this.api.create({
        sku: sku.toUpperCase(),
        name,
        description,
        priceCents: toCents(price),
        stock,
        categoryId,
      });
      f().reset({ ...EMPTY });
      this.created.emit(product);
      return [];
    } catch (error) {
      return this.serverErrors(toProblem(error), f);
    }
  }

  /**
   * The API is the final judge (400 zod `errors[]`, 409 with `field`, e.g. a SKU taken a second ago).
   * Map what we can to fields; anything else goes to the alert.
   */
  private serverErrors(
    problem: ProblemDetails,
    f: FieldTree<NewProductModel>,
  ): ValidationError.WithOptionalFieldTree[] {
    // API field names → form fields (`priceCents` is edited as `price` in dollars).
    const fields: Partial<Record<string, ReadonlyFieldTree<unknown>>> = {
      sku: f.sku,
      name: f.name,
      description: f.description,
      priceCents: f.price,
      stock: f.stock,
      categoryId: f.categoryId,
    };
    const field = problem['field'];
    const issues =
      problem.errors ??
      (typeof field === 'string'
        ? [{ path: field, message: problem.detail ?? problem.title }]
        : []);

    const errors = issues.flatMap(({ path, message }) => {
      const fieldTree = fields[path];
      return fieldTree ? [{ kind: 'server', message, fieldTree }] : [];
    });
    if (errors.length === 0 || errors.length < issues.length) this.problem.set(problem);
    return errors;
  }
}
