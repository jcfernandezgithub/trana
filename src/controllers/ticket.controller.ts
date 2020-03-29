import { BaseController } from "./base.controller";
import { Controller, Post } from "@overnightjs/core";
import { Response, Request } from "express";
import { Connection, EntityManager } from "typeorm";
import { Ticket } from "../entities/ticket.entity";

@Controller('api/ticket')
export class TicketController extends BaseController {

	@Post('show/:email')
	public async show(request: Request, response: Response) {
		const self = this;
		const email = request.params.email;

		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		let tickets: Ticket[] = await entityManager.find(Ticket, { createdBy: email });

		connection.close();
		return response.status(200).json(tickets);
	}

	@Post('create')
	public async create(request: Request, response: Response) {
		return response.status(200).json({ message: "ok" })
	}
}