import type { Request, Response } from 'express';
import { IdParam, SlugParam } from '../../shared/http.js';
import {
  CreateProductBody,
  ProductsQuery,
  SkuQuery,
  StockBody,
  UpdateProductBody,
} from './catalog.schemas.js';
import type { CatalogService } from './catalog.service.js';

export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  categories = async (_req: Request, res: Response) => {
    res.json(await this.service.categories());
  };

  list = async (req: Request, res: Response) => {
    res.json(await this.service.list(ProductsQuery.parse(req.query)));
  };

  bySlug = async (req: Request, res: Response) => {
    const { slug } = SlugParam.parse(req.params);
    res.json(await this.service.bySlug(slug));
  };

  skuAvailable = async (req: Request, res: Response) => {
    const { sku } = SkuQuery.parse(req.query);
    res.json(await this.service.skuAvailable(sku));
  };

  create = async (req: Request, res: Response) => {
    const product = await this.service.create(CreateProductBody.parse(req.body));
    res.status(201).location(`/api/products/${product.slug}`).json(product);
  };

  update = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    res.json(await this.service.update(id, UpdateProductBody.parse(req.body)));
  };

  adjustStock = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    const { delta } = StockBody.parse(req.body);
    res.json(await this.service.adjustStock(id, delta));
  };

  remove = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    await this.service.remove(id);
    res.status(204).end();
  };
}
