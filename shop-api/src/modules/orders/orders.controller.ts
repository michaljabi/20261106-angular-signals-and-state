import type { Request, Response } from 'express';
import { IdParam } from '../../shared/http.js';
import { currentUser } from '../../shared/middleware/auth.js';
import { OrdersQuery, PlaceOrderBody } from './orders.schemas.js';
import type { OrdersService } from './orders.service.js';

export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  list = async (req: Request, res: Response) => {
    res.json(await this.service.list(currentUser(req), OrdersQuery.parse(req.query)));
  };

  get = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    res.json(await this.service.get(currentUser(req), id));
  };

  place = async (req: Request, res: Response) => {
    const order = await this.service.place(currentUser(req), PlaceOrderBody.parse(req.body));
    res.status(201).location(`/api/orders/${order.id}`).json(order);
  };

  ship = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    res.json(await this.service.ship(id));
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    res.json(await this.service.cancel(currentUser(req), id));
  };
}
