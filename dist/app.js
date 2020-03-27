"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = __importDefault(require("cors"));
var path_1 = __importDefault(require("path"));
var body_parser_1 = __importDefault(require("body-parser"));
var morgan_1 = __importDefault(require("morgan"));
var express_1 = __importDefault(require("express"));
var socket_io_1 = __importDefault(require("socket.io"));
var express_handlebars_1 = __importDefault(require("express-handlebars"));
var core_1 = require("@overnightjs/core");
var router_class_1 = require("./router/router.class");
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super.call(this) || this;
        _this.app.engine('hbs', express_handlebars_1.default({
            extname: 'hbs',
            defaultLayout: 'main',
            layoutsDir: path_1.default.join(__dirname, 'views/layouts')
        }));
        _this.app.set('view engine', 'hbs');
        _this.app.set('views', path_1.default.join(__dirname, 'views'));
        _this.app.use('/uploads', express_1.default.static(__dirname + '/uploads/'));
        _this.app.use(cors_1.default());
        _this.app.use(express_1.default.json());
        _this.app.use(body_parser_1.default.urlencoded({ extended: true }));
        _this.app.use(morgan_1.default('dev'));
        _this.setupControllers();
        return _this;
    }
    App.prototype.setupControllers = function () {
        var router = new router_class_1.Router();
        _super.prototype.addControllers.call(this, [
            router.resellerController,
            router.authController,
            router.adminController
        ]);
    };
    App.prototype.init = function () {
        this.close = this.app.listen(process.env.PORT, function () {
            console.log('Server listening on port: ' + process.env.PORT);
        });
    };
    App.prototype.initSocket = function () {
        console.log('Socket connection has been established');
        var io = socket_io_1.default(this.close);
        io.on('connection', function (socket) {
            console.log('New socket has been connected');
        });
    };
    return App;
}(core_1.Server));
exports.default = App;
