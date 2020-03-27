import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, Connection, MongoRepository, OneToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import bcrypt from 'bcryptjs';
import { ObjectID, ObjectId } from "mongodb";

@Entity()
export class Reseller extends BaseEntity {

	@ObjectIdColumn()
	public _id: ObjectID;

	@Column()
	public name: string;

	@Column()
	public last_name: string;

	@Column({
		default: false
	})
	public status: boolean;

	@Column({
		unique: true
	})
	public email: string;

	@Column()
	password: string;

	@Column({
		default: null
	})
	sessionId: ObjectID;

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


	public async encrypt(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		return bcrypt.hash(password, salt);
	}

	public async compare(password: string, resellerPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, resellerPassword);
	}

}