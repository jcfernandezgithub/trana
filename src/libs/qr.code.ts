import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export class QRCode {

	generate(id: ObjectId): string {
		return jwt.sign({ id: id }, process.env.key || 'qr_code_key');
	}

	read(token: string) {
		return jwt.verify(token, process.env.key || 'qr_code_key');
	}
}