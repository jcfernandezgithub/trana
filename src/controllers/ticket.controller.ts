import fs from 'fs';
import moment from "moment";
import QRGenerator from 'qrcode';
import handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { QRCode } from "../libs/qr.code";
import { Response, Request } from "express";
import { Ticket } from "../entities/ticket.entity";
import { BaseController } from "./base.controller";
import { Connection, EntityManager } from "typeorm";
import { Mailer, mailOptions } from "../libs/mailer";
import { session } from "../middlewares/session.middleware";
import { Controller, Post, Middleware, Delete } from "@overnightjs/core";

@Controller('api/ticket')
export class TicketController extends BaseController {

	@Post('show/:email')
	public async show(request: Request, response: Response) {
		const self = this;
		const email = request.params.email;

		const connection: Connection = await self.getConnection();
		const entityManager: EntityManager = self.getManager();

		let tickets: Ticket[] = await entityManager.find(Ticket, { createdBy: email });

		connection.close();
		return response.status(200).json(tickets);
	}

	@Post('create')
	@Middleware([session])
	public async create(request: Request, response: Response) {
		const self = this;
		const { email, opening, reseller } = request.body;
		const expire = new Date(moment().add(2, 'weeks').format());
		let code = new QRCode().generate(email, expire);

		let ticket: Ticket = new Ticket();

		ticket.code = code;
		ticket.owner = email;
		ticket.used = false;
		ticket.createdBy = reseller;
		ticket.opening = opening;
		ticket.expire = expire;

		let fileLocation = './uploads/' + ticket.owner;
		let fileName = uuidv4() + '.jpeg';
		ticket.fullPath = "uploads/" + ticket.owner + '/' + fileName;
		ticket.file = fileName;

		if (!fs.existsSync(fileLocation)) {
			fs.mkdirSync(fileLocation);
		}

		const connection: Connection = await self.getConnection();
		const entityManager = self.getManager();

		const saved = await entityManager.save(Ticket, ticket);

		if (!saved) {
			connection.close();
			return response.status(400).json({ message: "error_saving" });
		}

		await QRGenerator.toFile(fileLocation + '/' + fileName, code, { errorCorrectionLevel: 'H' });

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
			connection.close();
			return response.status(401).json({ message: "could_not_send_email" });
		}

		connection.close();
		return response.status(200).json({ message: "ticket has been created" });
	}

	@Delete('delete')
	public async delete(request: Request, response: Response) {

	}

}