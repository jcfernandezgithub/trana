import { createConnection, Connection, getManager, EntityManager} from 'typeorm';

export class Database {
	
	public async getConnection(): Promise<Connection> {
		return createConnection();
	}
	

	public getManager(): EntityManager {
		return getManager();
	}
}