import { ObjectID, ObjectId } from "mongodb";
import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn } from "typeorm";

@Entity()
export class Session {

	@ObjectIdColumn()
	_id: ObjectID;

	@Column()
	token: string;

	@Column()
	user_id: ObjectId;

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

	public compare(token_1: string, token_2: string) {
		if (token_1 == token_2) {
			return true;
		}

		return false;
	}
}