import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import moment, { Moment } from "moment";
import { ObjectID } from "mongodb";
import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

interface IReset {
	readonly _id: ObjectID;
	email: string;
	token: string;
	expire: Date;
	createdAt: Date;
	updatedAt: Date;
	createToken(): Promise<string>;
	expired(date_1: Moment, date_2: Moment): boolean;
	compare(token_1: string, token_2: string): boolean;
}

@Entity()
export class Reset implements IReset {

	@ObjectIdColumn()
	_id: ObjectID;

	@Column()
	email: string;

	@Column()
	token: string;

	@Column()
	expire: Date;

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

	public async createToken(): Promise<string> {
		const token = crypto.randomBytes(32).toString('hex');
		const salt = await bcrypt.genSalt(10);
		return bcrypt.hashSync(token, salt);
	}

	public expired(now: Moment, expire: Moment): boolean {
		if (now < expire) {
			return false;
		}
		return true;
	};

	public compare(token_1: string, token_2: string): boolean {
		if (token_1 === token_2) {
			return true;
		}

		return false;
	}
}