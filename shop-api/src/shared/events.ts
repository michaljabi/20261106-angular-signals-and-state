import { EventEmitter } from 'node:events';
import type { OrderStatus, Role } from '../db/schema/index.js';

/**
 * Domain events pushed to browsers over SSE (GET /api/events).
 * Services emit them AFTER the transaction commits.
 */
export type DomainEvent =
  | { type: 'stock.changed'; productId: string; sku: string; stock: number }
  | { type: 'order.created'; orderId: string; number: string; buyerId: string }
  | {
      type: 'order.status-changed';
      orderId: string;
      number: string;
      status: OrderStatus;
      buyerId: string;
    };

export interface EventViewer {
  uuid: string;
  role: Role;
}

/** Who may receive which event. `null` viewer = anonymous visitor. */
export function canSee(event: DomainEvent, viewer: EventViewer | null): boolean {
  switch (event.type) {
    case 'stock.changed':
      return true;
    case 'order.created':
    case 'order.status-changed':
      return (
        viewer !== null &&
        (viewer.role === 'admin' ||
          viewer.role === 'stock-manager' ||
          viewer.uuid === event.buyerId)
      );
  }
}

export class EventBus {
  private readonly emitter = new EventEmitter().setMaxListeners(0);

  emit(event: DomainEvent): void {
    this.emitter.emit('event', event);
  }

  subscribe(listener: (event: DomainEvent) => void): () => void {
    this.emitter.on('event', listener);
    return () => this.emitter.off('event', listener);
  }
}
