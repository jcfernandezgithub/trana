import { ResellerController } from '../controllers/reseller.controller';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { TicketController } from '../controllers/ticket.controller';

export class Router {
	public resellerController = new ResellerController();
	public authController = new AuthController();
	public adminController = new AdminController();
	public ticketController = new TicketController();
}