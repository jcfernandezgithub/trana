import path from 'path';
import nodemailer from 'nodemailer';
const handlebars = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
	host: 'smtp.hostinger.com.ar',
	port: 587,
	auth: {
		user: 'jcfernandez@jcdeveloper.net',
		pass: '123456'
	}
});

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