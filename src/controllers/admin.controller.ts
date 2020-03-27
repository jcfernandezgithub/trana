import { Response, Request } from "express";
import { Controller, Post } from "@overnightjs/core";
import { Opening } from "../entities/opening.entity";
import { Connection } from "typeorm";
import { BaseController } from "./base.controller";

@Controller('api/admin')
export class AdminController extends BaseController {

	@Post('opening')
	public async createOpening(request: Request, response: Response) {
		const self = this;
		const { name } = request.body
		let opening: Opening = new Opening();

		opening.name = name;
		const connection: Connection = await self.getConnection();
		const saved: Opening = await opening.save();

		if (!saved) {
			connection.close();
			return response.status(400).json({ message: 'error_saving' });
		}
		connection.close();
		return response.status(200).json({ message: 'saved' });
	}
}