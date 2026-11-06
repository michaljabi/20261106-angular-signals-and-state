import type { Request, Response } from 'express';
import { IdParam } from '../../shared/http.js';
import { currentUser } from '../../shared/middleware/auth.js';
import { ChangeRoleBody, UsersQuery } from './users.schemas.js';
import type { UsersService } from './users.service.js';

export class UsersController {
  constructor(private readonly service: UsersService) {}

  list = async (req: Request, res: Response) => {
    res.json(await this.service.list(UsersQuery.parse(req.query)));
  };

  changeRole = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    const { role } = ChangeRoleBody.parse(req.body);
    res.json(await this.service.changeRole(currentUser(req), id, role));
  };

  remove = async (req: Request, res: Response) => {
    const { id } = IdParam.parse(req.params);
    await this.service.remove(currentUser(req), id);
    res.status(204).end();
  };
}
