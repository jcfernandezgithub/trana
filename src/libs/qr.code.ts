import jwt from 'jsonwebtoken';

export class QRCode {

	generate(email: string, expire: Date): string {
		return jwt.sign({ email: email, expire: expire }, process.env.key || 'qr_code_key');
	}
}