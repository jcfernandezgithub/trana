import path from 'path';
import nodemailer from 'nodemailer';
import config from '../config/global.config';

const handlebars = require('nodemailer-express-handlebars');
const transporter = nodemailer.createTransport(config.MAILER);

let hbsOptions = {
	viewEngine: {
		extName: '.hbs',
		partialsDir: path.resolve('./src/templates/'),
		layoutsDir: path.resolve('./src/templates/'),
		defaultLayout: 'confirm.hbs',
	},
	viewPath: path.resolve('./src/templates/'),
	extName: '.hbs',
}

transporter.use('compile', handlebars(hbsOptions));

export function sendEmail(options:any) {
	return transporter.sendMail(options);
}