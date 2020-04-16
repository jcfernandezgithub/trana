
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
import { createConnection, getManager } from 'typeorm';
import { User } from './entities/user.entity';
import { Opening } from './entities/opening.entity';
import { ObjectId } from 'mongodb';
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
		this.app.use('/public', express.static('./dist/templates'));
		this.app.use(cors());
		this.app.use(express.json())
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(morgan('dev'));
		this.setupControllers();

		createConnection().then(connection => {
			console.log(connection.name);
		}).catch(error => {
			console.log(error);
		});
	}

	private setupControllers() {
		let router = new Router();

		super.addControllers([
			router.userController,
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
			console.log('New socket has been connected: ', socket.id);

			const entityManager = getManager();

			socket.on('update_users', async () => {
				const users: User[] = await entityManager.find(User, { where: { $or: [{ role: 'reseller' }, { role: 'reader' }] }, order: { role: 'ASC' } });
				socket.emit('users', users);
				socket.broadcast.emit('users', users);
			});

			socket.on('update_openings', async () => {
				const openings: Opening[] = await entityManager.find(Opening, { order: { createdAt: 'DESC' } });
				socket.emit('openings', openings);
				socket.broadcast.emit('openings', openings);
			});

			socket.on('get_admin_by_id', async (id) => {
				const filter: ObjectId = new ObjectId(id);
				const user: User = await entityManager.findOneOrFail(User, { where: { _id: filter } });
				socket.emit('user', user);
			});

			socket.on('get_reader_by_id', async (id) => {
				const filter: ObjectId = new ObjectId(id);
				const user: User = await entityManager.findOneOrFail(User, { where: { _id: filter } });
				socket.emit('reader', user);
			});

			socket.on('get_reseller_by_id', async (id) => {
				const filter: ObjectId = new ObjectId(id);
				const user: User = await entityManager.findOneOrFail(User, { where: { _id: filter } });
				socket.emit('reseller', user);
			});

			socket.on('get_tickets_by_user', async (id) => {
				const filter: string = id;
				let tickets: Ticket[] = await entityManager.find(Ticket, { where: { createdBy: filter }, order: { createdAt: 'DESC' } });
				console.log(tickets, id);
				socket.emit('tickets', tickets);
			})
		});
	}
}