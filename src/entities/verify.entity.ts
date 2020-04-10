import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ObjectId } from "mongodb";
import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn } from "typeorm";

@Entity()
export class Verify {
	@ObjectIdColumn()
	_id: ObjectId

	@Column({ unique: true })
	email: string;

	@Column()
	token: string;

	@CreateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP(6)"
	})
	public createdAt: Date;

	@UpdateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"
	})
	public updatedAt: Date;

	public async tokenCreate() {
		const token = crypto.randomBytes(32).toString('hex');
		const salt = await bcrypt.genSalt(10);
		return bcrypt.hashSync(token, salt);
	}

	public compare(token_1: string, token_2: string) {
		if (token_1 === token_2) {
			return true;
		}

		return false;
	}
}