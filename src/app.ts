
import cors from 'cors';
import http from 'http';
import path from "path";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import express from 'express';
import hbs from "express-handlebars";
import { Server } from "@overnightjs/core";
import { Router } from "./router/router.class";
import SocketIO from 'socket.io';
import { Connection, EntityManager, getConnection, getManager } from "typeorm";
import { Ticket } from './entities/ticket.entity';

export default class App extends Server {
	private close: http.Server;

	constructor() {
		super();
		this.app.engine('hbs', hbs({
			extname: 'hbs',
			defaultLayout: 'main',
			layoutsDir: path.join(__dirname, 'views/layouts')
		}));
		this.app.set('view engine', 'hbs');
		this.app.set('views', path.join(__dirname, 'views'));
		this.app.use('/uploads', express.static('./uploads'));
		this.app.use(cors());
		this.app.use(express.json())
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(morgan('dev'));
		this.setupControllers();
	}

	private setupControllers() {
		let router = new Router();

		super.addControllers([
			router.resellerController,
			router.authController,
			router.adminController,
			router.ticketController,
			router.testController,
			router.openingController
		]);
	}

	init() {
		this.close = this.app.listen(process.env.PORT || 5000, () => {
			console.log('Server listening on port: ' + process.env.PORT);
		});
	}

	initSocket() {
		console.log('Socket connection has been established');
		const io = SocketIO(this.close);

		io.on('connection', (socket: SocketIO.Socket) => {
			console.log('New socket has been connected');


			socket.on('ticket_delete', async (message) => {
				console.log(message);
				const connection: Connection = getConnection();
				const entityManager: EntityManager = getManager();
				let tickets: Ticket[] | undefined = await entityManager.find(Ticket, { where: { createdBy: message.id }, order: { createdAt: 'DESC' } });
				connection.close();
				io.to(socket.id).emit('callback', tickets);
			});

		});
	}
}