import { Entity, BaseEntity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, ObjectID } from "typeorm";
import { ObjectId } from "mongodb";

@Entity()
export class Opening extends BaseEntity {
	@ObjectIdColumn()
	_id: ObjectId;

	@Column()
	name: string;

	@Column()
	close: Date;

	@Column()
	club_id: string;

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