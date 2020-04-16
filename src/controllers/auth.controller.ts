import { Response, Request } from "express";
import { BaseController } from "./base.controller";
import { EntityManager, getManager } from "typeorm";
import { User } from "../entities/user.entity";
import { Controller, Get, Post } from "@overnightjs/core";
import { Session } from "../entities/session.entity";
import jwt from 'jsonwebtoken';
import moment from "moment";
import { ObjectId } from "mongodb";

interface Payload {
	id: string;
	iat: number;
}

@Controller('api/auth')
export class AuthController extends BaseController {
	@Post('signin')
	public async signin(request: Request, response: Response) {

		const entityManager: EntityManager = getManager();
		const user: User | undefined = await entityManager.findOne(User, { email: request.body.email });

		if (user === undefined) {
			return response.status(400).json({ "message": 'user_not_found' });
		}
		const compare = await user.compare(request.body.password, user.password);

		if (!compare) {
			return response.status(400).json({ "message": 'wrong_password' });
		}

		if (!user.verified) {
			return response.status(400).json({ "message": "Cuenta no verificada" });
		}

		if (!user.status) {
			return response.status(400).json({ "message": "Cuenta inhabilitada" });
		}

		if (user.session_id) {
			await entityManager.delete(Session, { _id: user.session_id });

			const expire: Date = new Date(moment().add(1, "month").format());
			let session = new Session();
			session.user_id = user._id;
			session.token = jwt.sign({ id: user._id }, 'personal_access_token');
			session.email = user.email;
			session.role = user.role;
			session.expired_at = expire;
			const savedSession = await entityManager.save(Session, session);
			user.session_id = savedSession._id;
			await entityManager.save(User, user);

			return response.status(200).json(savedSession);
		}

		const expire: Date = new Date(moment().add(1, "month").format());
		let session = new Session();
		session.token = jwt.sign({ id: user._id }, 'personal_access_token');
		session.email = user.email;
		session.expired_at = expire;
		const savedSession = await entityManager.save(Session, session);
		user.session_id = savedSession._id;
		await entityManager.save(User, user);

		return response.status(200).json(savedSession);
	}

	@Get('signout/:id')
	public async signout(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();
		const session = await entityManager.findOne(Session, { _id: id });

		if (!session) {
			return response.status(400).json({ message: "Sesión cerrada" });
		}

		await entityManager.delete(Session, { _id: id });
		return response.status(200).json({ message: "Sesión cerrada" });
	}

	@Get('valid/:token')
	public async valid(request: Request, response: Response) {
		const token = request.params.token;
		const now = moment();
		const entityManager = getManager();
		let payload: Payload;

		try {
			payload = jwt.verify(token, "personal_access_token") as Payload;
		} catch {
			return response.send(false);
		}

		const filter = new ObjectId(payload.id);
		let session = await entityManager.findOne(Session, { user_id: filter });

		const compare = session?.compare(session.token, token);
		console.log(session?.token);

		if (!compare) {
			return response.send(false);
		}

		if (now.isSameOrAfter(session?.expired_at)) {
			return response.send(false);
		}

		return response.send(true);
	}
}
