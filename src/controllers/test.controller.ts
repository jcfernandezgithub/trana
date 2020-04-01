import { Controller, Get } from "@overnightjs/core";
import { Response, Request } from "express";
import { ObjectId } from "mongodb";
import { Ticket } from "../entities/ticket.entity";
import { BasicController } from './basic.controller';
import { Connection, EntityManager } from "typeorm";
import { BaseController } from "./base.controller";

@Controller('api/test')
export class TestController extends BaseController {

	@Get('search/:id')
	public async show(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		const ticket = await entityManager.findOne(Ticket, { _id: id });
		connection.close();
		return response.status(200).json({ ticket });
	}

}