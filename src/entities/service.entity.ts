import { Entity, BaseEntity, ObjectIdColumn } from "typeorm";

@Entity()
export class Service extends BaseEntity{
	@ObjectIdColumn()
	_id: string;
}