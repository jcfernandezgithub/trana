import { ObjectID } from "mongodb";
import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn } from "typeorm";

@Entity()
export class Session {

	@ObjectIdColumn()
	_id: ObjectID;

	@Column()
	token: string;

	@Column()
	email: string;

	@Column()
	expired_at: Date;

	@CreateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP(6)"
	})
	created_at: Date;

	@UpdateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"
	})
	updated_at: Date;

}