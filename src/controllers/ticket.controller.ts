import fs from 'fs';
import moment from 'moment';
import QRGenerator from 'qrcode';
import { ObjectId } from 'mongodb';
import handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { QRCode } from "../libs/qr.code";
import { Response, Request } from "express";
import { User } from '../entities/user.entity';
import { Ticket } from "../entities/ticket.entity";
import { EntityManager, getManager } from "typeorm";
import { Mailer, mailOptions } from "../libs/mailer";
import { Opening } from '../entities/opening.entity';
import { session } from '../middlewares/session.middleware';
import { Controller, Post, Delete, Get, Middleware } from "@overnightjs/core";
import config from '../config/global.config';

interface Payload {
	id: string;
	iat: number;
}

@Controller('api/ticket')
export class TicketController {

	@Get('show/:id')
	@Middleware([session])
	public async show(request: Request, response: Response) {
		const id = request.params.id;
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);

		let tickets: Ticket[] | undefined = await entityManager.find(Ticket, { where: { createdBy: id }, order: { createdAt: 'DESC' } });

		if (!tickets) {
			return response.status(400).json({ message: 'No existe entrada' });
		}
		return response.status(200).json(tickets);
	}

	@Post('edit/:id')
	public async update(request: Request, response: Response) {
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);
		const id: ObjectId = new ObjectId(request.params.id);

		const update = {
			gid: request.body.gid,
			owner: request.body.owner
		}

		const updated = await entityManager.update(Ticket, { _id: id }, update);

		if (!updated) {
			return response.status(400).json({ message: "Error" });
		}

		return response.status(200).json({ message: "Actualizado" });
	}

	@Post('create')
	@Middleware([session])
	public async create(request: Request, response: Response) {
		const entityManager = getManager(config.ENVIRONMENT);
		const email: string = request.body.email;
		const gid: string = request.body.gid;
		const openingId: ObjectId = new ObjectId(request.body.opening);
		const resellerId: string = request.body.reseller;

		const id: ObjectId = new ObjectId(resellerId);

		const opening: Opening | undefined = await entityManager.findOne(Opening, { where: { _id: openingId } });
		let reseller: User = await entityManager.findOneOrFail(User, { where: { _id: id } });

		if (!reseller) {
			return response.status(400).json({ message: "Error, vuelva a intentarlo" });
		}

		if (reseller.available(reseller.stock)) {
			return response.status(400).json({ message: "No te queda stock" });
		}

		if (!opening) {
			return response.status(400).json({ message: "Error, vuelva a intentarlo" });
		}

		let ticket: Ticket = new Ticket();
		ticket.gid = gid;
		ticket.owner = email;
		ticket.valid = true;
		ticket.createdBy = resellerId;
		ticket.opening = opening?.name.toLocaleLowerCase();
		ticket.expire = new Date(opening?.close);

		let fileLocation = './uploads/' + resellerId;
		let fileName = uuidv4() + '.jpeg';
		ticket.fullPath = "uploads/" + resellerId + '/' + fileName;
		ticket.file = fileName;

		if (!fs.existsSync(fileLocation)) {
			fs.mkdirSync(fileLocation);
		}

		const saved = await entityManager.save(Ticket, ticket);

		let token = new QRCode().generate(saved._id);

		if (!saved) {
			return response.status(400).json({ message: "Error al guardar" });
		}

		let stock = reseller.stock - 1;
		let user_updated = await entityManager.update(User, { _id: id }, { stock: stock });

		if (!user_updated) {
			return response.status(400).json({ message: "Error, vuelva a intentarlo" });
		}

		await QRGenerator.toFile(fileLocation + '/' + fileName, token, { errorCorrectionLevel: 'low' });

		let file = fs.readFileSync('dist/templates/template.hbs', 'utf8');

		let template = handlebars.compile(file);
		let compiled = template({ "qr": saved.fullPath });
		let mailer: Mailer = new Mailer();

		let options: mailOptions = {
			from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
			to: email,
			subject: 'Tu código QR',
			html: compiled
		}

		const sent = await mailer.sendMail(options);

		if (!sent) {
			return response.status(401).json({ message: "Error al enviar correo electrónico" });
		}
		return response.status(200).json({ message: "La entrada ha sido creada" });
	}

	@Delete('delete/:id/:user_id')
	@Middleware([session])
	public async delete(request: Request, response: Response) {
		const id: ObjectId = new ObjectId(request.params.id);
		const user_id: ObjectId = new ObjectId(request.params.user_id);
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);

		let user: User = await entityManager.findOneOrFail(User, { _id: user_id });

		if (!user) {
			return response.status(200).json({ message: "Error al elimiar" });
		}

		const deleted = await entityManager.delete(Ticket, { _id: id });

		let stock = user.stock + 1;

		let updated = await entityManager.update(User, { _id: user_id }, { stock: stock });

		if (!updated) {
			return response.status(200).json({ message: "Error al elimiar" });
		}

		if (!deleted) {
			return response.status(200).json({ message: "Error al elimiar" });
		}

		return response.status(200).json({ message: "La entrada ha sido eliminada" });
	}

	@Get('resend/:id')
	@Middleware([session])
	public async resend(request: Request, response: Response) {

		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);
		let ticket: Ticket | undefined = await entityManager.findOne(Ticket, { _id: id });

		if (!ticket) {
			return response.status(400).json({ message: "not_found" });
		}

		let file = fs.readFileSync('dist/templates/template.hbs', 'utf8');

		let template = handlebars.compile(file);
		let compiled = template({ "qr": ticket.fullPath });
		let mailer: Mailer = new Mailer();

		let options: mailOptions = {
			from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
			to: ticket.owner,
			subject: 'Tu código QR',
			html: compiled
		}

		const sent = await mailer.sendMail(options);

		if (!sent) {
			return response.status(401).json({ message: "Error al enviar correo electrónico" });
		}
		return response.status(200).json({ message: "La entrada ha sido enviada" });
	}

	@Get('read/:id')
	@Middleware([session])
	public async read(request: Request, response: Response) {

		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);
		let ticket: Ticket | undefined = await entityManager.findOne(Ticket, { _id: id });

		if (!ticket) {
			return response.status(400).json({ message: 'No se encontro entrada' });
		}

		if (!ticket.valid) {
			return response.status(400).json({ message: 'La entrada ya ha sido usada', ticket: ticket });
		}

		const now = moment();
		if (now.isSameOrAfter(ticket.expire)) {
			return response.status(400).json({ message: 'Esta entrada ya no es valida' });
		}

		let updated = await entityManager.update(Ticket, { _id: ticket._id }, { valid: false });

		if (!updated) {
			return response.status(400).json({ message: 'Problemas al leer vuelva a intentar' });
		}
		return response.status(200).json({ message: "Ingreso exitoso!" });
	}

	@Get('get/:token')
	@Middleware([session])
	public async get(request: Request, response: Response) {
		const qr = new QRCode();
		let token = qr.read(request.params.token) as Payload;

		if (!token) {
			return response.status(400).json({ message: 'Firma no valida, verificar origen de la entrada.' });
		}
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);

		const id: ObjectId = new ObjectId(token.id);
		let ticket: Ticket | undefined = await entityManager.findOne(Ticket, { _id: id });

		if (!ticket) {
			return response.status(400).json({ message: 'No se encontro entrada' });
		}
		return response.status(200).json(ticket);
	}

	@Get('list/:userId')
	@Middleware([session])
	public async view(request: Request, response: Response) {
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);
		const id = request.params.userId;

		let tickets = await entityManager.find(Ticket, { where: { createdBy: id }, order: { createdAt: 'DESC' } });
		return response.status(200).json(tickets);
	}

	@Get('opening/:openingName')
	@Middleware([session])
	public async byOpening(request: Request, response: Response) {
		const name = request.params.openingName;
		const entityManager: EntityManager = getManager(config.ENVIRONMENT);
		let tickets = await entityManager.find(Ticket, { where: { opening: name } });
		return response.status(200).json(tickets);
	}
}