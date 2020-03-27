import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { Session } from "../entities/session.entity";
import { Request, Response, NextFunction } from 'express';
import { createConnection, getManager, Connection, EntityManager } from "typeorm";

interface IPayload {
	email: string;
	expire: Date;
	iat: number;
}

export const session = async (request: Request, response: Response, next: NextFunction) => {

	const token = request.header('Authorization');

	if (!token) {
		let res = {
			message: "empty_authorization_header"
		};
		return response.status(401).json(res);
	}

	let payload: IPayload;

	try {
		payload = jwt.verify(token, process.env.key || 'personal_access_token') as IPayload;
	}
	catch {
		let res = {
			message: "token_does_not_match"
		};
		return response.status(401).json(res);
	}

	const connection: Connection = await createConnection();
	const entityManager: EntityManager = getManager();

	let session: Session | undefined = await entityManager.findOne(Session, { email: payload.email });

	if (session === undefined) {
		let res = {
			message: "no_session_found"
		};
		connection.close();
		return response.status(401).json(res);
	}

	if (session.token !== token) {
		let res = {
			message: "token_does_not_match"
		};
		connection.close();
		return response.status(401).json(res);
	}

	let now: Moment = moment();

	if (now.isSameOrAfter(payload.expire)) {
		let res = {
			message: "session_has_been_expired"
		};
		connection.close();
		return response.status(401).json(res);
	}

	connection.close();
	return next();
}

