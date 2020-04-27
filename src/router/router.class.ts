import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { TicketController } from '../controllers/ticket.controller';
import { TestController } from '../controllers/test.controller';
import { OpeningController } from '../controllers/opening.controller';
import { ServiceController } from '../controllers/service.controller';
import { ClubController } from '../controllers/club.controller';

export class Router {
	public userController = new UserController();
	public authController = new AuthController();
	public adminController = new AdminController();
	public ticketController = new TicketController();
	public testController = new TestController();
	public openingController = new OpeningController();
	public serviceController = new ServiceController();
	public clubController = new ClubController();
}