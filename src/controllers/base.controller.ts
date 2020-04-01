import { Database } from '../database/database.class';
import { Connection, EntityManager } from 'typeorm';

export class BaseController extends Database {
	public connection: Connection;
	public entityManager: EntityManager;

	constructor() {
		super();
		this.makeConnection();

		this.entityManager = this.getManager();
	}

	private async makeConnection(): Promise<void> {
		const self = this;
		const connection = await self.getConnection();
		self.connection = connection;
	}
}