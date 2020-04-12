import { ObjectId } from 'mongodb';
import multer from '../libs/multer';
import moment, { Moment } from 'moment'
import { Response, Request } from "express";
import { User } from "../entities/user.entity";
import { Reset } from '../entities/reset.entity';
import { Verify } from '../entities/verify.entity';
import { BaseController } from "./base.controller";
import { EntityManager, getManager } from "typeorm";
import { Session } from "../entities/session.entity";
import { mailOptions, Mailer } from '../libs/mailer';

import { Controller, Post, Get, Patch, Delete, Middleware } from "@overnightjs/core";

@Controller('api/user')
export class UserController extends BaseController {

	@Post('create')
	public async create(request: Request, response: Response) {

		const self = this;
		let entityManager: EntityManager = getManager();
		let u: User | undefined = await entityManager.findOne(User, { email: request.body.email });

		if (u) {
			return response.status(400).json({ "message": "El usuario ya existe" });
		}

		let user: User = new User();
		user.email = request.body.email;
		user.name = request.body.name;
		user.last_name = request.body.last_name;
		user.status = request.body.status;
		user.role = request.body.role;
		user.age = request.body.age;
		user.stock = request.body.stock;
		user.phone = request.body.phone;
		user.verified = false;
		user.password = await user.encrypt(request.body.password);

		const saved: User = await entityManager.save(User, user);

		let verify = new Verify();

		verify.email = saved.email;
		verify.token = await verify.tokenCreate();

		const verify_saved = await entityManager.save(Verify, verify);

		const url = `${request.protocol}://${request.get('host')}/api/user/confirm/${verify_saved.email}/${encodeURIComponent(verify_saved.token.toString())}`;

		let options: mailOptions = {
			from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
			to: verify_saved.email,
			subject: 'Confirm your account',
			html: '<h4><b>Confirmation</b></h4>' +
				'<p>Click here to confirm:</p>' +
				`<a href="${url}">Confirm</a>` +
				'<br><br>' +
				'<p>--Team</p>'
		};

		const email: Mailer = new Mailer();
		const sent = email.sendMail(options);

		if (!sent) {
			let res = {
				success: false,
				message: "Erroral enviar correo electrónico"
			}
			return response.status(400).json(res);
		}

		let res = {
			success: true,
			message: "El usuario ha sido creado"
		}
		return response.status(200).json(res);
	}

	@Get('show')
	public async show(request: Request, response: Response) {
		const entityManager: EntityManager = getManager();
		const users: User[] = await entityManager.find(User, { where: { $or: [{ role: 'reseller' }, { role: 'reader' }] }, order: { role: 'ASC' } });
		return response.status(200).json(users);
	}

	@Get('role/:role')
	public async showByRole(request: Request, response: Response) {
		const entityManager: EntityManager = getManager();
		let filter = { role: request.params.role };
		let users: User[] | undefined = await entityManager.find(User, { where: filter });

		if (!users) {
			return response.status(400).json({ message: 'No se encontraron usuarios' });
		}

		return response.status(200).json(users);
	}

	@Get('show/:id')
	public async showById(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

		let user: User | undefined = await entityManager.findOne(User, { _id: id });

		if (!user) {
			return response.status(400).json({ message: "Usuario no existe" });
		}

		return response.status(200).json(user);
	}

	@Patch('update/:id')
	public async update(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.params.id);
		const filter = { _id: id };
		let user: User = request.body;

		const entityManager: EntityManager = getManager();
		let saved = await entityManager.update(User, filter, user);

		if (!saved) {
			let res = {
				"message": "Error alactualizar, intente otra vez"
			}
			return response.status(400).json(res);
		}
		return response.status(200).json({ "message": "Actualizado" });
	}

	@Get('forgot/:email')
	public async forgot(request: Request, response: Response) {

		const email: string = request.params.email;
		const entityManager: EntityManager = getManager();
		const user: User | undefined = await entityManager.findOne(User, { email: email });

		if (!user) {
			let res = {
				success: false,
				message: "Usuario no encontrado"
			}
			return response.status(400).json(res);
		}

		await entityManager.delete(Reset, { email: user.email });

		let reset: Reset = new Reset();
		const token: string = await reset.createToken();

		reset.email = user.email;
		reset.token = token;
		reset.expire = new Date(moment().add(1, 'hour').format());

		const saved = await entityManager.save(Reset, reset);

		if (!saved) {
			let result = {
				success: false,
				message: "No se pudo procesar su peticion, intente otra vez"
			}
			return response.status(400).json(result);
		}

		const url = `${request.protocol}://${request.get('host')}/api/user/reset/${saved._id}/${encodeURIComponent(token.toString())}`;

		let options: mailOptions = {
			from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
			to: user.email,
			subject: 'Reset your account password',
			html: '<h4><b>Reset Password</b></h4>' +
				'<p>To reset your password, complete this form:</p>' +
				`<a href="${url}">Cambiar</a>` +
				'<br><br>' +
				'<p>--Team</p>'
		}
		const mailer: Mailer = new Mailer();
		const sent = mailer.sendMail(options);

		if (!sent) {
			let res = {
				success: false,
				message: "No se pudo procesar su peticion, intente otra vez"
			}
			return response.status(400).json(res);
		}

		let res = {
			success: true,
			message: "El correo fue enviado, verifique su bandeja de entrada"
		}
		return response.status(200).json(res);
	}

	@Get('reset/:id/:token')
	public async reset(request: Request, response: Response) {
		const id = request.params.id;
		const token = decodeURIComponent(request.params.token);

		return response.render('reset', { id, token });
	}

	@Post('password')
	public async password(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.body.id);
		const token = request.body.token;
		const password = request.body.password;
		const entityManager: EntityManager = getManager();
		const reset: Reset | undefined = await entityManager.findOne(Reset, { _id: id });

		if (reset === undefined) {
			let res = {
				success: false,
				message: "reset_request_not_found"
			}
			return response.status(400).json(res);
		}

		const now: Moment = moment();
		const expired: boolean = now.isSameOrAfter(reset.expire);

		if (expired) {
			let res = {
				success: false,
				message: "El token ha expirado, envie uno nuevo"
			}
			return response.status(400).json(res);
		}

		const compare = reset.compare(token, reset.token);

		if (!compare) {
			let res = {
				success: true,
				message: "El token no coincide, cree uno nuevo"
			}
			return response.status(400).json(res);
		}

		const filter = { _id: id };
		const user = new User();
		const new_password: string = user.encrypt(password);
		const update = { password: new_password };
		const doc = await entityManager.update(User, filter, update);

		if (!doc) {
			return response.status(400).json({ message: 'error' });
		}

		await entityManager.delete(Reset, { _id: id });

		let res = {
			success: true,
			message: "La contraseña ha sido cambiada",
		}
		return response.json(res);
	}

	@Post('upload/:id')
	@Middleware(multer.single('photo'))
	public async upload(request: Request, response: Response) {

		const id: ObjectId = new ObjectId(request.params.id);

		const entityManager: EntityManager = getManager();
		const updated = await entityManager.update(User, { _id: id }, { photo: request.file.path });

		if (!updated) {
			return response.status(400).json({ message: "Error al guardar" });
		}
		return response.status(200).json({ message: "La imagen ha sido guardada" });
	}

	@Get('confirm/:email/:token')
	public async verify(request: Request, response: Response) {

		const self = this;
		const email = request.params.email;
		const token = request.params.token;
		const entityManager: EntityManager = getManager();
		const verify: Verify = await entityManager.findOneOrFail(Verify, { email: email });
		const verified = verify.compare(verify.token, decodeURIComponent(token));

		if (!verified) {
			let res = {
				success: false,
				message: "Token no coincide"
			}
			return response.status(400).json(res);
		}

		const filter = { email: email };
		const user = await entityManager.update(User, filter, { verified: true })
		await entityManager.delete(Verify, { email: email });

		if (!user) {
			let res = {
				success: false,
				message: "No existe usuario"
			}
			return response.status(400).json(res);
		}

		let res = {
			message: "El usuario ha sido verificado"
		}

		return response.status(200).json(res);
	}

	@Delete('delete/:id')
	public async delete(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);

		const entityManager: EntityManager = getManager();

		const deleted = await entityManager.delete(User, { _id: id });

		if (!deleted) {
			return response.status(400).json({ message: "Error al eliminar" });
		}

		return response.status(200).json({ message: "Usuario ha sido eliminado" });
	}

	@Get('valid/:id/:token')
	public async valid(request: Request, response: Response) {

		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const token_1: string = request.params.token;

		const entityManager: EntityManager = getManager();
		let session: Session | undefined = await entityManager.findOne(Session, { _id: id });

		if (!session?.compare(token_1, session.token)) {
			return response.status(400).send(false);
		}
		return response.status(200).send(true);
	}

}