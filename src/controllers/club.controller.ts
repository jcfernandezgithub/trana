import { Post, Get, Controller, Delete } from "@overnightjs/core";
import { Response, Request } from "express";
import { EntityManager, getManager } from "typeorm";
import { Club } from "../entities/club.entity";
import { ObjectId } from "mongodb";
import { OK, BAD_REQUEST } from 'http-status-codes';

@Controller('api/club')
export class ClubController {

	@Post('create')
	public async create(request: Request, response: Response) {
		const manager: EntityManager = getManager();
		let club: Club = request.body;
		let saved = await manager.save(Club, club);

		if (!saved) {
			return response.status(BAD_REQUEST).json({ message: 'Error al guardar' });
		}
		return response.status(OK).json({ message: 'Guardado correctamente' });
	}

	@Get('show/:user_id')
	public async showById(request: Request, response: Response) {
		const manager: EntityManager = getManager();
		const filter = request.params.user_id;

		let clubs: Club[] = await manager.find(Club, { where: { user_id: filter } });

		if (!clubs) {
			return response.status(BAD_REQUEST).json({ message: 'No se encontro clubs' });
		}
		return response.status(OK).json(clubs);
	}

	@Delete('delete/:id')
	public async delete(request: Request, response: Response) {
		const manager: EntityManager = getManager();
		const id: ObjectId = new ObjectId(request.params.id);
		console.log(id);
		let deleted = await manager.delete(Club, { where: { _id: id } });

		if (!deleted) {
			return response.status(BAD_REQUEST).json({ message: "Error al eliminar" });
		}
		return response.status(OK).json({ message: "Club ha sido eliminado" });
	}

}