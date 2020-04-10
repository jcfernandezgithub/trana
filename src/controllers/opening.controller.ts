import { Controller, Get, Post, Delete } from "@overnightjs/core";
import { Connection, EntityManager, getManager } from "typeorm";
import { BaseController } from "./base.controller";
import { Request, Response } from "express";
import { Opening } from "../entities/opening.entity";
import { ObjectId } from "mongodb";

@Controller('api/opening')
export class OpeningController extends BaseController {
	@Get('show')
	public async show(request: Request, response: Response) {
		const entityManager: EntityManager = getManager();

		let openings: Opening[] = await entityManager.find(Opening, { order: { createdAt: 'DESC' } });

		if (!openings) {
			return response.status(400).json({ message: 'not_openings_found' });
		}
		return response.status(200).json(openings);
	}

	@Get('show/:id')
	public async showById(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

		let opening: Opening | undefined = await entityManager.findOne(Opening, { _id: id });

		if (!opening) {
			return response.status(400).json({ message: 'not_openings_found' });
		}
		return response.status(200).json(opening);
	}

	@Post('create')
	public async create(request: Request, response: Response) {

		const name: string = request.body.name;
		const close: Date = request.body.close;
		let opening: Opening = new Opening();

		opening.name = name.toLocaleLowerCase();
		opening.close = close;

		const entityManager: EntityManager = getManager();
		const saved: Opening = await entityManager.save(Opening, opening);

		if (!saved) {
			return response.status(400).json({ message: 'error_saving' });
		}
		return response.status(200).json({ message: 'saved' });
	}

	@Delete('delete/:id')
	public async delete(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

		const deleted = await entityManager.delete(Opening, { _id: id });

		if (!deleted) {
			return response.status(200).json({ message: "deletion_failed" });
		}
		return response.status(200).json({ message: "opening has been deleted" });
	}
}