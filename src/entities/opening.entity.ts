import { Entity, BaseEntity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, ObjectID } from "typeorm";

@Entity()
export class Opening extends BaseEntity {
	@ObjectIdColumn()
	_id: string;

	@Column()
	name: string;

	@Column()
	close: Date;

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