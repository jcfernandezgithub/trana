import { Controller, Get, Post, Delete, Middleware } from "@overnightjs/core";
import { EntityManager, getManager } from "typeorm";
import { BaseController } from "./base.controller";
import { Request, Response } from "express";
import { Opening } from "../entities/opening.entity";
import { ObjectId } from "mongodb";
import { session } from "../middlewares/session.middleware";

@Controller('api/opening')
export class OpeningController extends BaseController {
	
	@Get('show')
	@Middleware([session])
	public async show(request: Request, response: Response) {
		const entityManager: EntityManager = getManager();

		let openings: Opening[] = await entityManager.find(Opening, { order: { createdAt: 'DESC' } });

		if (!openings) {
			return response.status(400).json({ message: 'No se encontro apertura' });
		}
		return response.status(200).json(openings);
	}

	@Get('show/:id')
	@Middleware([session])
	public async showById(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

		let opening: Opening | undefined = await entityManager.findOne(Opening, { _id: id });

		if (!opening) {
			return response.status(400).json({ message: 'No se encontro apertura' });
		}
		return response.status(200).json(opening);
	}

	@Post('create')
	@Middleware([session])
	public async create(request: Request, response: Response) {

		const name: string = request.body.name;
		const close: Date = request.body.close;
		let opening: Opening = new Opening();

		opening.name = name.toLocaleLowerCase();
		opening.close = close;

		const entityManager: EntityManager = getManager();
		const saved: Opening = await entityManager.save(Opening, opening);

		if (!saved) {
			return response.status(400).json({ message: 'Error al guardar' });
		}
		return response.status(200).json({ message: 'Guardado' });
	}

	@Delete('delete/:id')
	@Middleware([session])
	public async delete(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

		const deleted = await entityManager.delete(Opening, { _id: id });

		if (!deleted) {
			return response.status(200).json({ message: "Error al eliminar" });
		}
		return response.status(200).json({ message: "Apertura ha sido eliminada" });
	}
}