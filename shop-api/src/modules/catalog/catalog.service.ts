import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js';
import type { EventBus } from '../../shared/events.js';
import type { Page } from '../../shared/pagination.js';
import { slugify } from '../../shared/slug.js';
import {
  toCategoryDto,
  toProductDto,
  type CategoryDto,
  type ProductDto,
} from './catalog.mapper.js';
import type { CatalogRepository } from './catalog.repository.js';
import type { CreateProductBody, ProductsQuery, UpdateProductBody } from './catalog.schemas.js';

export class CatalogService {
  constructor(
    private readonly repo: CatalogRepository,
    private readonly events: EventBus,
  ) {}

  async categories(): Promise<CategoryDto[]> {
    return (await this.repo.listCategories()).map(toCategoryDto);
  }

  async list(query: ProductsQuery): Promise<Page<ProductDto>> {
    const { items, total } = await this.repo.listProducts(query);
    return { items: items.map(toProductDto), total, page: query.page, pageSize: query.pageSize };
  }

  async bySlug(slug: string): Promise<ProductDto> {
    const product = await this.repo.findActiveBySlug(slug);
    if (!product) throw new NotFoundError('Product');
    return toProductDto(product);
  }

  /** For the async validator in the "new product" form. */
  async skuAvailable(sku: string): Promise<{ sku: string; available: boolean }> {
    return { sku, available: !(await this.repo.skuExists(sku)) };
  }

  async create(body: CreateProductBody): Promise<ProductDto> {
    const category = await this.repo.findCategoryByUuid(body.categoryId);
    if (!category) throw new BadRequestError('Unknown category.', { field: 'categoryId' });
    if (await this.repo.skuExists(body.sku)) {
      throw new ConflictError(`SKU ${body.sku} is already taken.`, { field: 'sku' });
    }
    const slug = body.slug ?? slugify(body.name);
    if (await this.repo.slugExists(slug)) {
      throw new ConflictError(`Slug "${slug}" is already taken.`, { field: 'slug' });
    }
    const row = await this.repo.insert({
      sku: body.sku,
      slug,
      name: body.name,
      description: body.description,
      priceCents: body.priceCents,
      stock: body.stock,
      categoryId: category.id,
    });
    return toProductDto({ ...row, category });
  }

  async update(uuid: string, body: UpdateProductBody): Promise<ProductDto> {
    const product = await this.getOrThrow(uuid);
    let categoryId: number | undefined;
    if (body.categoryId) {
      const category = await this.repo.findCategoryByUuid(body.categoryId);
      if (!category) throw new BadRequestError('Unknown category.', { field: 'categoryId' });
      categoryId = category.id;
    }
    await this.repo.update(product.id, {
      name: body.name,
      description: body.description,
      priceCents: body.priceCents,
      categoryId,
    });
    return toProductDto((await this.repo.findActiveByUuid(uuid))!);
  }

  async adjustStock(uuid: string, delta: number): Promise<ProductDto> {
    const product = await this.getOrThrow(uuid);
    const result = await this.repo.adjustStock(product.id, delta);
    if (!result) {
      throw new ConflictError(`Stock of ${product.sku} cannot go below 0.`, {
        stock: product.stock,
        delta,
      });
    }
    this.events.emit({
      type: 'stock.changed',
      productId: result.uuid,
      sku: result.sku,
      stock: result.stock,
    });
    return toProductDto({ ...product, stock: result.stock });
  }

  async remove(uuid: string): Promise<void> {
    const product = await this.getOrThrow(uuid);
    await this.repo.softDelete(product.id);
  }

  private async getOrThrow(uuid: string) {
    const product = await this.repo.findActiveByUuid(uuid);
    if (!product) throw new NotFoundError('Product');
    return product;
  }
}
