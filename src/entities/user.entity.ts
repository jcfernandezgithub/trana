import bcrypt from 'bcryptjs';
import { ObjectID, ObjectId } from "mongodb";
import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn } from "typeorm";

export interface IUser {
	_id: ObjectId;
	name: string;
	age: number;
	last_name: string;
	photo: string;
	phone: string;
	status: boolean;
	verified: boolean;
	role: string;
	email: string;
	password: string;
	stock: number;
	session_id: ObjectId;
	createdAt: Date;
	updatedAt: Date;
	encrypt_password(password: string): string;
	compare(password: string, resellerPassword: string): Promise<boolean>;
	available(stock: number): boolean;
}

@Entity()
export class User implements IUser{

	@ObjectIdColumn()
	public _id: ObjectId;

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

	@Column()
	session_id: ObjectId;

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


	encrypt_password(password: string): string {
		const salt = bcrypt.genSaltSync(10);
		return bcrypt.hashSync(password, salt);
	}

	async compare(password: string, resellerPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, resellerPassword);
	}

	available(stock: number): boolean {
		return stock <= 0;
	}

}