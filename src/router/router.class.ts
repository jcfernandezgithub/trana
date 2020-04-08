import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { TicketController } from '../controllers/ticket.controller';
import { TestController } from '../controllers/test.controller';
import { OpeningController } from '../controllers/opening.controller';

export class Router {
	public userController = new UserController();
	public authController = new AuthController();
	public adminController = new AdminController();
	public ticketController = new TicketController();
	public testController = new TestController();
	public openingController = new OpeningController();
}