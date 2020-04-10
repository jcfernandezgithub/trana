import fs from 'fs';
import moment from 'moment';
import QRGenerator from 'qrcode';
import { ObjectId } from 'mongodb';
import handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { QRCode } from "../libs/qr.code";
import { Response, Request, request } from "express";
import { Ticket } from "../entities/ticket.entity";
import { BaseController } from "./base.controller";
import { Connection, EntityManager, getManager } from "typeorm";
import { Mailer, mailOptions } from "../libs/mailer";
import { Opening } from '../entities/opening.entity';
import { Controller, Post, Middleware, Delete, Get } from "@overnightjs/core";

interface Payload {
	id: string;
	iat: number;
}

@Controller('api/ticket')
export class TicketController extends BaseController {

	@Get('show/:id')
	public async show(request: Request, response: Response) {
		const self = this;
		const id = request.params.id;
		const entityManager: EntityManager = getManager();

		let tickets: Ticket[] | undefined = await entityManager.find(Ticket, { where: { createdBy: id }, order: { createdAt: 'DESC' } });

		if (!tickets) {
			return response.status(400).json({ message: 'not_found' });
		}
		return response.status(200).json(tickets);
	}

	@Post('create')
	public async create(request: Request, response: Response) {
		const self = this;
		const entityManager = getManager();

		const email: string = request.body.email;
		const gid: string = request.body.gid;
		const openingId: ObjectId = new ObjectId(request.body.opening);
		const resellerId: string = request.body.reseller;

		const opening: Opening | undefined = await entityManager.findOne(Opening, { where: { _id: openingId } });

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
			return response.status(400).json({ message: "error_saving" });
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
			return response.status(401).json({ message: "could_not_send_email" });
		}
		return response.status(200).json({ message: "ticket has been created" });
	}

	@Delete('delete/:id')
	public async delete(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

		const deleted = await entityManager.delete(Ticket, { _id: id });

		if (!deleted) {
			return response.status(200).json({ message: "deletion_failed" });
		}
		return response.status(200).json({ message: "ticket has been deleted" });
	}

	@Get('resend/:id')
	public async resend(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);
		const entityManager: EntityManager = getManager();

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
			return response.status(401).json({ message: "could_not_send_email" });
		}
		return response.status(200).json({ message: "ticket has been sent" });
	}

	@Get('read/:id')
	public async read(request: Request, response: Response) {
		const self = this;
		const id: ObjectId = new ObjectId(request.params.id);

		const entityManager: EntityManager = getManager();

		let ticket: Ticket | undefined = await entityManager.findOne(Ticket, { _id: id });

		if (!ticket) {
			return response.status(400).json({ message: 'No se encontro entrada' });
		}

		if (!ticket.valid) {
			return response.status(400).json({ message: 'La entrada ya ha sido usada', ticket: ticket});
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
	public async get(request: Request, response: Response) {
		const self = this;
		const qr = new QRCode();

		let token = qr.read(request.params.token) as Payload;

		if (!token) {
			return response.status(400).json({ message: 'Firma no valida, verificar origen de la entrada.' });
		}
		const entityManager: EntityManager = getManager();

		const id: ObjectId = new ObjectId(token.id);
		let ticket: Ticket | undefined = await entityManager.findOne(Ticket, { _id: id });

		if (!ticket) {
			return response.status(400).json({ message: 'No se encontro entrada' });
		}
		return response.status(200).json(ticket);
	}
}