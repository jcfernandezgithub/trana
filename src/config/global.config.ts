import dotenv from 'dotenv';
dotenv.config();

export default {
	PORT: process.env.PORT,
	ENVIRONMENT: process.env.ENVIRONMENT,
	JWT_KEY: process.env.JWT_KEY,
	MAILER: {
		host: 'smtp.hostinger.com.ar',
		port: 587,
		auth: {
			user: 'jcfernandez@jcdeveloper.net',
			pass: '123456'
		}
	}
}