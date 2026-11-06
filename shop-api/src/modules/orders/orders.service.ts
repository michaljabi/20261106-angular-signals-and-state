import type { Db } from '../../db/client.js';
import type { AuthUser } from '../../shared/context.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors.js';
import type { DomainEvent, EventBus } from '../../shared/events.js';
import type { Page } from '../../shared/pagination.js';
import type { CatalogRepository } from '../catalog/catalog.repository.js';
import { toOrderDto, type OrderDto } from './orders.mapper.js';
import type { OrdersRepository } from './orders.repository.js';
import type { OrdersQuery, PlaceOrderBody } from './orders.schemas.js';

const isStaff = (u: AuthUser) => u.role === 'admin' || u.role === 'stock-manager';

export class OrdersService {
  constructor(
    private readonly db: Db,
    private readonly repo: OrdersRepository,
    /** Orders do not own stock: they ask the catalog to change it, inside the same transaction. */
    private readonly catalog: CatalogRepository,
    private readonly events: EventBus,
  ) {}

  /** Buyers see their own orders; staff see all. */
  async list(actor: AuthUser, query: OrdersQuery): Promise<Page<OrderDto>> {
    const { items, total } = await this.repo.list(query, isStaff(actor) ? undefined : actor.id);
    return { items: items.map(toOrderDto), total, page: query.page, pageSize: query.pageSize };
  }

  async get(actor: AuthUser, uuid: string): Promise<OrderDto> {
    return toOrderDto(await this.getVisibleOrThrow(actor, uuid));
  }

  /**
   * All or nothing: every line reserves stock in one transaction.
   * If any product is short, everything rolls back and the client gets 409.
   */
  async place(buyer: AuthUser, body: PlaceOrderBody): Promise<OrderDto> {
    const stockEvents: DomainEvent[] = [];

    const orderUuid = await this.db.transaction(async (tx) => {
      const ids = body.lines.map((l) => l.productId);
      const found = await this.catalog.findActiveByUuids(ids, tx);
      const byUuid = new Map(found.map((p) => [p.uuid, p]));
      const missing = ids.filter((id) => !byUuid.has(id));
      if (missing.length) {
        throw new BadRequestError('Some products do not exist.', { productIds: missing });
      }

      const lines = [];
      for (const line of body.lines) {
        const product = byUuid.get(line.productId)!;
        const result = await this.catalog.adjustStock(product.id, -line.quantity, tx);
        if (!result) {
          throw new ConflictError(`Not enough stock for ${product.sku}.`, {
            productId: product.uuid,
            sku: product.sku,
            requested: line.quantity,
            available: product.stock,
          });
        }
        stockEvents.push({
          type: 'stock.changed',
          productId: result.uuid,
          sku: result.sku,
          stock: result.stock,
        });
        lines.push({
          productId: product.id,
          quantity: line.quantity,
          unitPriceCents: product.priceCents,
        });
      }

      const number = await this.repo.nextNumber(tx);
      const order = await this.repo.insert(tx, { number, userId: buyer.id }, lines);
      return order.uuid;
    });

    // Emit only after commit: listeners never see data that was rolled back.
    const order = toOrderDto((await this.repo.findByUuid(orderUuid))!);
    stockEvents.forEach((e) => this.events.emit(e));
    this.events.emit({
      type: 'order.created',
      orderId: order.id,
      number: order.number,
      buyerId: buyer.uuid,
    });
    return order;
  }

  async ship(uuid: string): Promise<OrderDto> {
    const order = await this.repo.findByUuid(uuid);
    if (!order) throw new NotFoundError('Order');
    if (order.status !== 'new') {
      throw new ConflictError(`Only new orders can be shipped (this one is ${order.status}).`);
    }
    await this.repo.setStatus(order.id, 'shipped');
    return this.afterStatusChange(uuid);
  }

  /** Buyer: own new orders. Staff: any new order. Stock goes back. */
  async cancel(actor: AuthUser, uuid: string): Promise<OrderDto> {
    const order = await this.getVisibleOrThrow(actor, uuid);
    if (order.status !== 'new') {
      throw new ConflictError(`Only new orders can be cancelled (this one is ${order.status}).`);
    }
    const stockEvents: DomainEvent[] = [];
    await this.db.transaction(async (tx) => {
      for (const line of order.lines) {
        // Soft-deleted products are skipped: nothing to put back on a shelf that is gone.
        const result = await this.catalog.adjustStock(line.productId, line.quantity, tx);
        if (result) {
          stockEvents.push({
            type: 'stock.changed',
            productId: result.uuid,
            sku: result.sku,
            stock: result.stock,
          });
        }
      }
      await this.repo.setStatus(order.id, 'cancelled', tx);
    });
    stockEvents.forEach((e) => this.events.emit(e));
    return this.afterStatusChange(uuid);
  }

  private async afterStatusChange(uuid: string): Promise<OrderDto> {
    const order = toOrderDto((await this.repo.findByUuid(uuid))!);
    this.events.emit({
      type: 'order.status-changed',
      orderId: order.id,
      number: order.number,
      status: order.status,
      buyerId: order.buyer.id,
    });
    return order;
  }

  /** Buyers get 404 (not 403) for other people's orders: do not reveal that they exist. */
  private async getVisibleOrThrow(actor: AuthUser, uuid: string) {
    const order = await this.repo.findByUuid(uuid);
    if (!order || (!isStaff(actor) && order.userId !== actor.id)) {
      throw new NotFoundError('Order');
    }
    return order;
  }
}
