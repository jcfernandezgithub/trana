import bcrypt from 'bcryptjs';
import { ObjectID } from "mongodb";
import { BaseEntity } from "./base.entity";
import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {

	@ObjectIdColumn()
	public _id: ObjectID;

	@Column()
	public name: string;

	@Column()
	public age: number;

	@Column()
	public last_name: string;

	@Column()
	public photo: string;

	@Column()
	public status: boolean;

	@Column()
	public verified: boolean;

	@Column()
	public role: string;
	
	@Column({
		unique: true
	})
	public email: string;

	@Column()
	password: string;

	@Column()
	stock: number;

	@Column()
	phone: string;

	@Column({
		default: null
	})
	session_id: ObjectID;

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


	public encrypt(password: string): string {
		const salt = bcrypt.genSaltSync(10);
		return bcrypt.hashSync(password, salt);
	}

	public async compare(password: string, resellerPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, resellerPassword);
	}

	public available(stock: number): boolean {
		return stock <= 0;
	}

}