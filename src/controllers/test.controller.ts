import { Controller, Get } from "@overnightjs/core";
import { Response, Request } from "express";
import { ObjectId } from "mongodb";
import { Ticket } from "../entities/ticket.entity";
import { Connection, EntityManager } from "typeorm";
import { getManager } from "typeorm";
import { User } from "../entities/user.entity";


@Controller('api/test')
export class TestController {

	@Get('search/:id')
	public async show(request: Request, response: Response) {
		const connection = getManager();
		console.log(connection);
		let tickets = await connection.find(User, { where: { email: 'jcfernandez@outlook.com.ar' } });
		return response.json(tickets);
	}

}