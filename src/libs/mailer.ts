import nodemailer from 'nodemailer';
import Mail from "nodemailer/lib/mailer";

export interface mailOptions {
	from: string;
	to: string;
	subject: string;
	html: string | object;
}

export class Mailer {

	private transporter: Mail;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: 'smtp.hostinger.com.ar',
			port: 587,
			secure: false,
			auth: {
				user: 'jcfernandez@jcdeveloper.net',
				pass: '123456'
			}
		});
	}

	sendMail(options: mailOptions) {
		const self = this;
		return self.transporter.sendMail(options);
	}
}