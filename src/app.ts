import cors from 'cors';
import fs from 'fs';
import http from 'http';
import path from "path";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import express from 'express';
import hbs from "express-handlebars";
import { Server } from "@overnightjs/core";
import SocketIO from 'socket.io';
import { createConnection, getManager } from 'typeorm';
import { User } from './entities/user.entity';
import { Opening } from './entities/opening.entity';
import { ObjectId } from 'mongodb';
import { Ticket } from './entities/ticket.entity';
import { Club } from './entities/club.entity';
import config from './config/global.config';

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
		this.router();

		if (config.ENVIRONMENT == 'production') {
			createConnection('development').then(connection => {
				console.log(connection.name);
			}).catch(error => {
				console.log(error);
			});
		} else {
			createConnection('development').then(connection => {
				console.log(connection.name);
			}).catch(error => {
				console.log(error);
			});
		}
	}

	router() {
		const files: string[] | Buffer[] = fs.readdirSync(__dirname + '/controllers/');
		files.forEach(async (e) => {
			let module = this.parser(e);
			import(`${__dirname}/controllers/${path.parse(e).name}`).then((m) => this.addControllers(new m[module])).catch(e => console.log(e));
		});
	}

	parser(filename: string): string {
		let response = path.parse(filename).name;
		return this.capitalizer(response);
	}

	capitalizer(str: string): string {
		let response = str.charAt(0).toUpperCase() + str.slice(1);
		response = response.replace('controller', 'Controller');
		return response.replace('.', '');
	}

	init() {
		this.close = this.app.listen(process.env.PORT, () => {
			console.log('Server listening on port: ' + config.PORT);
		});
	}

	initSocket() {
		console.log('Socket connection has been established');
		const io = SocketIO(this.close);

		io.on('connection', (socket: SocketIO.Socket) => {
			console.log('New socket has been connected: ', socket.id);

			const entityManager = getManager(config.ENVIRONMENT);

			socket.on('update_users', async () => {
				const users: User[] = await entityManager.find(User, { where: { $or: [{ role: 'reseller' }, { role: 'reader' }] }, order: { role: 'ASC' } });
				socket.emit('users', users);
				socket.broadcast.emit('users', users);
			});

			socket.on('get_resellers_limited', async () => {
				const users: User[] = await entityManager.find(User, { where: { $or: [{ role: 'reseller' }] }, take: 5, order: { role: 'ASC' } });
				socket.emit('resellers_limited', users);
				socket.broadcast.emit('reseller_limited', users);
			});

			socket.on('get_openings_by_club', async (id) => {
				const openings: Opening[] = await entityManager.find(Opening, { where: { club_id: id }, order: { createdAt: 'DESC' } });
				console.log(openings, id)
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
			});

			socket.on('get_clubs_by_user', async (id: string) => {
				let clubs: Club[] = await entityManager.find(Club, { where: { user_id: id } });
				console.log(clubs, id);
				socket.emit('clubs', clubs);
			});

		});
	}
}