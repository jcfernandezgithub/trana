import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { Session } from "../entities/session.entity";
import { Request, Response, NextFunction } from 'express';
import { getManager, EntityManager } from "typeorm";
import { ObjectId } from 'mongodb';
import config from '../config/global.config';

interface IPayload {
	id: string;
	iat: number;
}

export const session = async (request: Request, response: Response, next: NextFunction) => {

	const token = request.header('Authorization');

	if (!token) {
		let results = {
			message: "Encabezado de autorización vacío"
		}
		return response.status(401).json(results);
	}

	let payload: IPayload;

	try {
		payload = jwt.verify(token, config.JWT_KEY) as IPayload;
	}
	catch {
		let res = {
			message: "No autorizado, token invalido"
		};
		return response.status(401).json(res);
	}

	const entityManager: EntityManager = getManager();
	let filter = new ObjectId(payload.id);
	let session: Session | undefined = await entityManager.findOne(Session, { user_id: filter });

	if (session === undefined) {
		let res = {
			message: "No se encontro sesión"
		};
		return response.status(401).json(res);
	}

	if (session.token !== token) {
		let res = {
			message: "No autorizado, token invalido"
		};
		return response.status(401).json(res);
	}

	let now: Moment = moment();

	if (now.isSameOrAfter(session.expired_at)) {
		let res = {
			message: "La sesión ha expirado"
		};
		return response.status(401).json(res);
	}

	return next();

}

