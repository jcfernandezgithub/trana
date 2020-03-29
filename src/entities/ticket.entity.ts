import { Entity, ObjectIdColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Ticket extends BaseEntity {

	@ObjectIdColumn()
	_id: string;

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