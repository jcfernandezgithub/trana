import fs from 'fs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
; import { v4 as uuidv4 } from 'uuid';
import moment, { Moment } from 'moment'
import { Response, Request } from "express";
import { Reset } from '../entities/reset.entity';
import { Verify } from '../entities/verify.entity';
import { BaseController } from "./base.controller";
import { EntityManager, Connection } from "typeorm";
import { Session } from "../entities/session.entity";
import { mailOptions, Mailer } from '../libs/mailer';
import { Reseller } from "../entities/reseller.entity";
import { session } from '../middlewares/session.middleware';
import { Controller, Post, Get, Patch, Delete, Middleware } from "@overnightjs/core";
import multer from '../libs/multer';

@Controller('api/reseller')
export class ResellerController extends BaseController {

	@Post('signin')
	public async signin(request: Request, response: Response) {

		const self = this;
		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		const reseller: Reseller | undefined = await entityManager.findOne(Reseller, { email: request.body.email });

		if (reseller === undefined) {
			connection.close();
			return response.status(400).json({ "message": 'reseller_not_found' });
		}
		const compare = await reseller.compare(request.body.password, reseller.password);

		if (!compare) {
			connection.close();
			return response.status(400).json({ "message": 'wrong_password' });
		}

		if (reseller.sessionId) {
			await entityManager.delete(Session, { id: reseller.sessionId });

			const expire: Date = new Date(moment().add(1, "week").format());
			let session = new Session();
			session.resellerId = reseller._id;
			session.token = jwt.sign({ email: reseller.email, expire: expire }, 'personal_access_token');
			session.email = reseller.email;
			session.expired_at = expire;
			const savedSession = await entityManager.save(Session, session);
			reseller.sessionId = savedSession._id;
			await entityManager.save(Reseller, reseller);

			await connection.close();
			return response.status(200).json(savedSession);
		}

		const expire: Date = new Date(moment().add(1, "week").format());
		let session = new Session();
		session.token = jwt.sign({ id: reseller.email, expire: expire }, 'personal_access_token');
		session.email = reseller.email;
		session.expired_at = expire;
		const savedSession = await entityManager.save(Session, session);
		reseller.sessionId = savedSession._id;
		await entityManager.save(Reseller, reseller);

		await connection.close();
		return response.status(200).json(savedSession);
	}

	@Get('signout')
	public async signout(request: Request, response: Response) {
		return response.status(200).json({ message: "signed out" });
	}

	@Post('create')
	public async create(request: Request, response: Response) {

		const self = this;

		const connection = await self.getConnection();

		let entityManager: EntityManager = self.getManager();

		let r: Reseller | undefined = await entityManager.findOne(Reseller, { email: request.body.email });

		if (r) {
			connection.close();
			return response.status(400).json({ "message": "duplicated" });
		}

		let reseller: Reseller = new Reseller();

		reseller.name = request.body.name;
		reseller.last_name = request.body.last_name;
		reseller.email = request.body.email;
		reseller.password = await reseller.encrypt(request.body.password);

		const saved: Reseller = await entityManager.save(Reseller, reseller);

		let verify = new Verify();

		verify.email = saved.email;
		verify.token = await verify.tokenCreate();

		const verify_saved = await entityManager.save(Verify, verify);

		const url = `${request.protocol}://${request.get('host')}/api/reseller/verify/${verify_saved.email}/${encodeURIComponent(verify_saved.token.toString())}`;

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
				message: "Error to send email"
			}

			return response.status(400).json(res);
		}

		let res = {
			success: true,
			message: "User has been creted, please confirm your email address"
		}
		connection.close();
		return response.status(200).json(res);
	}

	@Get('show')
	public async show(request: Request, response: Response) {
		const self = this;

		const connection = await self.getConnection();

		const repo = connection.getMongoRepository(Reseller);
		let resellers: Reseller[] = await repo.find();

		return response.status(200).json({
			resellers: resellers
		});
	}

	@Get('show/:id')
	public async showById(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);

		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		let reseller: Reseller | undefined = await entityManager.findOne(Reseller, { _id: id });

		if (!reseller) {
			connection.close();
			return response.status(400).json({ message: "not_found" });
		}

		connection.close();
		return response.status(200).json(reseller);
	}

	@Patch('update/:id')
	@Middleware([session])
	public async update(request: Request, response: Response) {
		const self = this;
		const filter = { email: request.params.email };
		let reseller: Reseller = request.body;
		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		let saved = await entityManager.update(Reseller, filter, reseller);

		if (!saved) {
			let res = {
				"message": "error_updating, try again"
			}
			connection.close()
			return response.status(400).json(res);
		}
		connection.close();
		return response.status(200).json({ "message": "updated" });
	}

	@Get('forgot/:email')
	public async forgot(request: Request, response: Response) {
		const self = this;
		const email = request.params.email;
		const connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		const reseller = await entityManager.findOneOrFail(Reseller, { email: email });

		if (!reseller) {
			let res = {
				success: false,
				message: "Reseller not found"
			}

			return response.status(400).json(res);
		}

		await entityManager.delete(Reset, { email: email });

		let reset: Reset = new Reset();
		const token: string = await reset.createToken();

		reset.email = reseller.email;
		reset.token = token;
		reset.expire = new Date(moment().add(1, 'hour').format());

		const saved = await entityManager.save(Reset, reset);

		if (!saved) {
			let result = {
				success: false,
				message: "We could't process your request, try again"
			}
			connection.close();
			return response.status(400).json(result);
		}

		const url = `${request.protocol}://${request.get('host')}/api/reseller/reset/${email}/${encodeURIComponent(token.toString())}`;

		let options: mailOptions = {
			from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
			to: reseller.email,
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
			console.log(email);
			let res = {
				success: false,
				message: "We couldn't process your request, try again"
			}
			connection.close();
			return response.status(400).json(res);
		}

		let res = {
			success: true,
			message: "Email was sent, please check your mail box"
		}
		connection.close();
		return response.status(200).json(res);
	}

	@Get('reset/:email/:token')
	public async reset(request: Request, response: Response) {
		const email = request.params.email;
		const token = decodeURIComponent(request.params.token);

		return response.render('reset', { email, token });
	}

	@Post('password')
	public async password(request: Request, response: Response) {
		const self = this;
		const { email, token, password } = request.body;
		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		const reset: Reset | undefined = await entityManager.findOne(Reset, { email: email });

		if (reset === undefined) {
			let res = {
				success: false,
				message: "reset_request_not_found"
			}
			connection.close();
			return response.status(400).json(res);
		}

		const now: Moment = moment();
		const expired: boolean = now.isSameOrAfter(reset.expire);

		if (expired) {
			let res = {
				success: false,
				message: "Token has been expired, please create new one"
			}
			connection.close();
			return response.status(400).json(res);
		}

		const compare = reset.compare(token, reset.token);

		if (!compare) {
			let res = {
				success: true,
				message: "Token doesn't match, please create new one"
			}
			connection.close();
			return response.status(400).json(res);
		}


		const filter = { email: email };
		const reseller = new Reseller();
		const update = { password: await reseller.encrypt(password) };
		const doc = await entityManager.update(Reseller, filter, update);

		if (doc) {
			await entityManager.delete(Reset, { email: email });
		}

		let res = {
			success: true,
			message: "Password has been reset",
			reseller: doc
		}

		connection.close();
		return response.json(res);
	}

	@Post('upload/:id')
	@Middleware(multer.single('photo'))
	public async upload(request: Request, response: Response) {
		console.log(request.file);

		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);

		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		const updated = await entityManager.update(Reseller, { _id: id }, { photo: request.file.path });

		if (!updated) {
			connection.close();
			return response.status(200).json({ message: "upload_failed" });
		}
		connection.close();
		return response.status(200).json({ message: "Image has been uploaded" });
	}

	@Get('verify/:email/:token')
	public async verify(request: Request, response: Response) {

		const self = this;
		const email = request.params.email;
		const token = request.params.token;
		const connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		const verify: Verify = await entityManager.findOneOrFail(Verify, { email: email });
		const verified = verify.compare(verify.token, decodeURIComponent(token));

		if (!verified) {
			let res = {
				success: false,
				message: "Token doesn't match"
			}
			return response.status(400).json(res);
		}

		const filter = { email: email };
		const reseller = await entityManager.update(Reseller, filter, { status: true })
		await entityManager.delete(Verify, { email: email });

		if (!reseller) {
			let res = {
				success: false,
				message: "User not found"
			}
			return response.status(400).json(res);
		}

		let res = {
			message: "User has been verified, thanks"
		}

		connection.close();
		return response.status(200).json(res);
	}

	@Delete('delete/:id')
	public async delete(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);

		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		const deleted = await entityManager.delete(Reseller, { _id: id });

		if (!deleted) {
			connection.close();
			return response.status(400).json({ message: "deletion failed" });
		}

		connection.close();
		return response.status(200).json({ message: "reseller has been deleted" });
	}

	@Get('valid/:id/:token')
	public async valid(request: Request, response: Response) {

		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const token_1: string = request.params.token;

		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();
		let session: Session | undefined = await entityManager.findOne(Session, { _id: id });

		if (!session?.compare(token_1, session.token)) {
			connection.close();
			return response.status(400).send(false);
		}

		connection.close();
		return response.status(200).send(true);
	}

}