import dotenv from 'dotenv';
dotenv.config();

export default {
	PORT: process.env.PORT,
	ENVIRONMENT: process.env.ENVIRONMENT,
	JWT_KEY: '6c650fa9285c2c0eaf2027a5acd33a3c21b5d6299560b53b84ff1c545d2841461b75060a2a265de1cd5774c7f5ba4b47c7b2e6873c6f89a6870c1edd79853c72',
	MAILER: {
		host: 'smtp.hostinger.com.ar',
		port: 587,
		auth: {
			user: 'jcfernandez@jcdeveloper.net',
			pass: '123456'
		}
	}
}