import { Entity, BaseEntity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectId } from "mongodb";

@Entity()
export class Service extends BaseEntity {

	@ObjectIdColumn()
	_id: string;

	@Column()
	expire: Date;

	@Column()
	name: string;

	@Column()
	paid: boolean;

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