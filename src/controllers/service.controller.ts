import { Response, Request } from "express";
import { Controller, Post } from "@overnightjs/core";
import { Service } from "../entities/service.entity";
import { getManager, EntityManager } from "typeorm";

@Controller('api/service')
export class ServiceController {

	@Post('create')
	public async create(request: Request, response: Response) {
		const service: Service = request.body;
		return response.status(200).json(service);
	}

}