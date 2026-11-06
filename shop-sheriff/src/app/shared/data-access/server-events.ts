import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, distinctUntilChanged, filter, map, share, switchMap } from 'rxjs';
import { Session } from './session';

/** Events pushed by shop-api over SSE (`GET /api/events`), filtered by the viewer's role. */
export type ServerEvent =
  | { type: 'stock.changed'; productId: string; sku: string; stock: number }
  | { type: 'order.created'; orderId: string; number: string; buyerId: string }
  | {
      type: 'order.status-changed';
      orderId: string;
      number: string;
      status: 'new' | 'shipped' | 'cancelled';
      buyerId: string;
    }
  | {
      type: 'article.status-changed';
      articleId: string;
      slug: string;
      status: string;
      version: number;
      authorId: string;
    }
  | { type: 'moderation.queue-changed'; pending: number };

export type ServerEventType = ServerEvent['type'];

const TYPES: readonly ServerEventType[] = [
  'stock.changed',
  'order.created',
  'order.status-changed',
  'article.status-changed',
  'moderation.queue-changed',
];

/**
 * One shared EventSource for the whole app (RxJS: a stream of events, not state).
 * Reconnects when the user changes: the cookie decides which events we get.
 * Browser only: on the server the stream is empty.
 */
@Injectable({ providedIn: 'root' })
export class ServerEvents {
  private readonly session = inject(Session);

  readonly all$: Observable<ServerEvent> = isPlatformBrowser(inject(PLATFORM_ID))
    ? toObservable(this.session.user).pipe(
        map((user) => user?.id ?? null),
        distinctUntilChanged(),
        switchMap(() => connect()),
        share(),
      )
    : EMPTY;

  on<T extends ServerEventType>(type: T): Observable<Extract<ServerEvent, { type: T }>> {
    return this.all$.pipe(filter((e): e is Extract<ServerEvent, { type: T }> => e.type === type));
  }
}

function connect(): Observable<ServerEvent> {
  return new Observable<ServerEvent>((subscriber) => {
    const source = new EventSource('/api/events', { withCredentials: true });
    const onEvent = (e: MessageEvent<string>) => subscriber.next(JSON.parse(e.data) as ServerEvent);
    TYPES.forEach((t) => source.addEventListener(t, onEvent));
    // EventSource reconnects by itself (`retry: 3000` from the API).
    return () => source.close();
  });
}
