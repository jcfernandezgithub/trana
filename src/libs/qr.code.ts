import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export class QRCode {

	generate(id: ObjectId): string {
		return jwt.sign({ id: id }, process.env.key || 'qr_code_key');
	}

	read(token: string) {
		let results = jwt.verify(token, process.env.key || 'qr_code_key');

		if (results) {
			return results;
		}
		return false;
	}
}