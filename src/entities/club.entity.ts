import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectId } from "mongodb";

@Entity()
export class Club {
	@ObjectIdColumn()
	_id: ObjectId;

	@Column()
	name: string;

	@Column()
	address: string;

	@Column()
	description: string;

	@Column()
	photo: string;

	@Column()
	user_id: ObjectId; 

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
}