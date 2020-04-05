import { Controller, Get, Post, Delete } from "@overnightjs/core";
import { Connection, EntityManager } from "typeorm";
import { BaseController } from "./base.controller";
import { Request, Response } from "express";
import { Opening } from "../entities/opening.entity";
import { ObjectId } from "mongodb";

@Controller('api/opening')
export class OpeningController extends BaseController {
	@Get('show')
	public async show(request: Request, response: Response) {
		const self = this;
		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		let openings: Opening[] = await entityManager.find(Opening);

		if (!openings) {
			connection.close();
			return response.status(200).json({ message: 'not_openings_found'});
		}
		connection.close();
		return response.status(200).json(openings);
	}

	@Post('create')
	public async create(request: Request, response: Response) {
		const self = this;

		const name: string = request.body.name;
		const close: Date = request.body.close;
		let opening: Opening = new Opening();

		opening.name = name;
		opening.close = close;

		const connection: Connection = await self.getConnection();
		const saved: Opening = await opening.save();

		if (!saved) {
			connection.close();
			return response.status(400).json({ message: 'error_saving' });
		}
		connection.close();
		return response.status(200).json({ message: 'saved' });
	}

	@Delete('delete/:id')
	public async delete(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		const deleted = await entityManager.delete(Opening, { _id: id });

		if (!deleted) {
			connection.close();
			return response.status(200).json({ message: "deletion_failed" });
		}

		connection.close();
		return response.status(200).json({ message: "opening has been deleted" });
	}
}