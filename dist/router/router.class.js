"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reseller_controller_1 = require("../controllers/reseller.controller");
var auth_controller_1 = require("../controllers/auth.controller");
var admin_controller_1 = require("../controllers/admin.controller");
var Router = /** @class */ (function () {
    function Router() {
        this.resellerController = new reseller_controller_1.ResellerController();
        this.authController = new auth_controller_1.AuthController();
        this.adminController = new admin_controller_1.AdminController();
    }
    return Router;
}());
exports.Router = Router;
