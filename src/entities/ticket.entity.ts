import { Entity, ObjectIdColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectId } from "mongodb";

@Entity()
export class Ticket extends BaseEntity {

	@ObjectIdColumn()
	_id: ObjectId;

	@Column()
	code: string;

	@Column()
	owner: string;

	@Column()
	createdBy: string;

	@Column()
	opening: string;

	@Column({
		default: false
	})
	used: boolean;

	@Column()
	fullPath: string;

	@Column()
	file: string;

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
}