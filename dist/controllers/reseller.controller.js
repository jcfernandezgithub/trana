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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var qrcode_1 = __importDefault(require("qrcode"));
var uuid_1 = require("uuid");
var handlebars_1 = __importDefault(require("handlebars"));
var moment_1 = __importDefault(require("moment"));
var qr_code_1 = require("../libs/qr.code");
var reset_entity_1 = require("../entities/reset.entity");
var ticket_entity_1 = require("../entities/ticket.entity");
var verify_entity_1 = require("../entities/verify.entity");
var base_controller_1 = require("./base.controller");
var session_entity_1 = require("../entities/session.entity");
var mailer_1 = require("../libs/mailer");
var reseller_entity_1 = require("../entities/reseller.entity");
var session_middleware_1 = require("../middlewares/session.middleware");
var core_1 = require("@overnightjs/core");
var ResellerController = /** @class */ (function (_super) {
    __extends(ResellerController, _super);
    function ResellerController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ResellerController.prototype.signin = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, connection, entityManager, reseller, compare, expire_1, session_1, savedSession_1, expire, session, savedSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _a.sent();
                        entityManager = self.getManager();
                        return [4 /*yield*/, entityManager.findOne(reseller_entity_1.Reseller, { email: request.body.email })];
                    case 2:
                        reseller = _a.sent();
                        if (reseller === undefined) {
                            connection.close();
                            return [2 /*return*/, response.status(400).json({ "message": 'reseller_not_found' })];
                        }
                        return [4 /*yield*/, reseller.compare(request.body.password, reseller.password)];
                    case 3:
                        compare = _a.sent();
                        if (!compare) {
                            connection.close();
                            return [2 /*return*/, response.status(400).json({ "message": 'wrong_password' })];
                        }
                        if (!reseller.sessionId) return [3 /*break*/, 8];
                        return [4 /*yield*/, entityManager.delete(session_entity_1.Session, { id: reseller.sessionId })];
                    case 4:
                        _a.sent();
                        expire_1 = new Date(moment_1.default().add(1, "week").format());
                        session_1 = new session_entity_1.Session();
                        session_1.token = jsonwebtoken_1.default.sign({ email: reseller.email, expire: expire_1 }, 'personal_access_token');
                        session_1.email = reseller.email;
                        session_1.expired_at = expire_1;
                        return [4 /*yield*/, entityManager.save(session_entity_1.Session, session_1)];
                    case 5:
                        savedSession_1 = _a.sent();
                        reseller.sessionId = savedSession_1._id;
                        return [4 /*yield*/, entityManager.save(reseller_entity_1.Reseller, reseller)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, connection.close()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, response.status(200).json(savedSession_1)];
                    case 8:
                        expire = new Date(moment_1.default().add(1, "week").format());
                        session = new session_entity_1.Session();
                        session.token = jsonwebtoken_1.default.sign({ id: reseller.email, expire: expire }, 'personal_access_token');
                        session.email = reseller.email;
                        session.expired_at = expire;
                        return [4 /*yield*/, entityManager.save(session_entity_1.Session, session)];
                    case 9:
                        savedSession = _a.sent();
                        reseller.sessionId = savedSession._id;
                        return [4 /*yield*/, entityManager.save(reseller_entity_1.Reseller, reseller)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, connection.close()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, response.status(200).json(savedSession)];
                }
            });
        });
    };
    ResellerController.prototype.create = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, connection, entityManager, r, reseller, _a, saved, verify, _b, verify_saved, url, options, email, sent, res_1, res;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _c.sent();
                        entityManager = self.getManager();
                        return [4 /*yield*/, entityManager.findOne(reseller_entity_1.Reseller, { email: request.body.email })];
                    case 2:
                        r = _c.sent();
                        if (r) {
                            connection.close();
                            return [2 /*return*/, response.status(400).json({ "message": "duplicated" })];
                        }
                        reseller = new reseller_entity_1.Reseller();
                        reseller.name = request.body.name;
                        reseller.last_name = request.body.last_name;
                        reseller.email = request.body.email;
                        _a = reseller;
                        return [4 /*yield*/, reseller.encrypt(request.body.password)];
                    case 3:
                        _a.password = _c.sent();
                        return [4 /*yield*/, entityManager.save(reseller_entity_1.Reseller, reseller)];
                    case 4:
                        saved = _c.sent();
                        verify = new verify_entity_1.Verify();
                        verify.email = saved.email;
                        _b = verify;
                        return [4 /*yield*/, verify.tokenCreate()];
                    case 5:
                        _b.token = _c.sent();
                        return [4 /*yield*/, entityManager.save(verify_entity_1.Verify, verify)];
                    case 6:
                        verify_saved = _c.sent();
                        url = request.protocol + "://" + request.get('host') + "/api/reseller/verify/" + verify_saved.email + "/" + encodeURIComponent(verify_saved.token.toString());
                        options = {
                            from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
                            to: verify_saved.email,
                            subject: 'Confirm your account',
                            html: '<h4><b>Confirmation</b></h4>' +
                                '<p>Click here to confirm:</p>' +
                                ("<a href=\"" + url + "\">Confirm</a>") +
                                '<br><br>' +
                                '<p>--Team</p>'
                        };
                        email = new mailer_1.Mailer();
                        sent = email.sendMail(options);
                        if (!sent) {
                            res_1 = {
                                success: false,
                                message: "Error to send email"
                            };
                            return [2 /*return*/, response.status(400).json(res_1)];
                        }
                        res = {
                            success: true,
                            message: "User has been creted, please confirm your email address"
                        };
                        connection.close();
                        return [2 /*return*/, response.status(200).json(res)];
                }
            });
        });
    };
    ResellerController.prototype.show = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, connection, repo, resellers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _a.sent();
                        repo = connection.getMongoRepository(reseller_entity_1.Reseller);
                        return [4 /*yield*/, repo.find()];
                    case 2:
                        resellers = _a.sent();
                        return [2 /*return*/, response.status(200).json({
                                resellers: resellers
                            })];
                }
            });
        });
    };
    ResellerController.prototype.update = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, filter, reseller, connection, entityManager, saved, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        filter = { email: request.params.email };
                        reseller = request.body;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _a.sent();
                        entityManager = self.getManager();
                        return [4 /*yield*/, entityManager.update(reseller_entity_1.Reseller, filter, reseller)];
                    case 2:
                        saved = _a.sent();
                        if (!saved) {
                            res = {
                                "message": "error_updating, try again"
                            };
                            connection.close();
                            return [2 /*return*/, response.status(400).json(res)];
                        }
                        connection.close();
                        return [2 /*return*/, response.status(200).json({ "message": "updated" })];
                }
            });
        });
    };
    ResellerController.prototype.forgot = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, email, connection, entityManager, reseller, res_2, reset, token, saved, result, url, options, mailer, sent, res_3, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        email = request.params.email;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _a.sent();
                        entityManager = self.getManager();
                        return [4 /*yield*/, entityManager.findOneOrFail(reseller_entity_1.Reseller, { email: email })];
                    case 2:
                        reseller = _a.sent();
                        if (!reseller) {
                            res_2 = {
                                success: false,
                                message: "Reseller not found"
                            };
                            return [2 /*return*/, response.status(400).json(res_2)];
                        }
                        return [4 /*yield*/, entityManager.delete(reset_entity_1.Reset, { email: email })];
                    case 3:
                        _a.sent();
                        reset = new reset_entity_1.Reset();
                        return [4 /*yield*/, reset.createToken()];
                    case 4:
                        token = _a.sent();
                        reset.email = reseller.email;
                        reset.token = token;
                        reset.expire = new Date(moment_1.default().add(1, 'hour').format());
                        return [4 /*yield*/, entityManager.save(reset_entity_1.Reset, reset)];
                    case 5:
                        saved = _a.sent();
                        if (!saved) {
                            result = {
                                success: false,
                                message: "We could't process your request, try again"
                            };
                            connection.close();
                            return [2 /*return*/, response.status(400).json(result)];
                        }
                        url = request.protocol + "://" + request.get('host') + "/api/reseller/reset/" + email + "/" + encodeURIComponent(token.toString());
                        options = {
                            from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
                            to: reseller.email,
                            subject: 'Reset your account password',
                            html: '<h4><b>Reset Password</b></h4>' +
                                '<p>To reset your password, complete this form:</p>' +
                                ("<a href=\"" + url + "\">Cambiar</a>") +
                                '<br><br>' +
                                '<p>--Team</p>'
                        };
                        mailer = new mailer_1.Mailer();
                        sent = mailer.sendMail(options);
                        if (!sent) {
                            console.log(email);
                            res_3 = {
                                success: false,
                                message: "We couldn't process your request, try again"
                            };
                            connection.close();
                            return [2 /*return*/, response.status(400).json(res_3)];
                        }
                        res = {
                            success: true,
                            message: "Email was sent, please check your mail box"
                        };
                        connection.close();
                        return [2 /*return*/, response.status(200).json(res)];
                }
            });
        });
    };
    ResellerController.prototype.reset = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var email, token;
            return __generator(this, function (_a) {
                email = request.params.email;
                token = decodeURIComponent(request.params.token);
                return [2 /*return*/, response.render('reset', { email: email, token: token })];
            });
        });
    };
    ResellerController.prototype.password = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, _a, email, token, password, connection, entityManager, reset, res_4, now, expired, res_5, compare, res_6, filter, reseller, update, _b, doc, res;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        self = this;
                        _a = request.body, email = _a.email, token = _a.token, password = _a.password;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _c.sent();
                        entityManager = self.getManager();
                        return [4 /*yield*/, entityManager.findOne(reset_entity_1.Reset, { email: email })];
                    case 2:
                        reset = _c.sent();
                        if (reset === undefined) {
                            res_4 = {
                                success: false,
                                message: "reset_request_not_found"
                            };
                            connection.close();
                            return [2 /*return*/, response.status(400).json(res_4)];
                        }
                        now = moment_1.default();
                        expired = now.isSameOrAfter(reset.expire);
                        if (expired) {
                            res_5 = {
                                success: false,
                                message: "Token has been expired, please create new one"
                            };
                            connection.close();
                            return [2 /*return*/, response.status(400).json(res_5)];
                        }
                        compare = reset.compare(token, reset.token);
                        if (!compare) {
                            res_6 = {
                                success: true,
                                message: "Token doesn't match, please create new one"
                            };
                            connection.close();
                            return [2 /*return*/, response.status(400).json(res_6)];
                        }
                        filter = { email: email };
                        reseller = new reseller_entity_1.Reseller();
                        _b = {};
                        return [4 /*yield*/, reseller.encrypt(password)];
                    case 3:
                        update = (_b.password = _c.sent(), _b);
                        return [4 /*yield*/, entityManager.update(reseller_entity_1.Reseller, filter, update)];
                    case 4:
                        doc = _c.sent();
                        if (!doc) return [3 /*break*/, 6];
                        return [4 /*yield*/, entityManager.delete(reset_entity_1.Reset, { email: email })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        res = {
                            success: true,
                            message: "Password has been reset",
                            reseller: doc
                        };
                        connection.close();
                        return [2 /*return*/, response.json(res)];
                }
            });
        });
    };
    ResellerController.prototype.verify = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, email, token, connection, entityManager, verify, verified, res_7, filter, reseller, res_8, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        email = request.params.email;
                        token = request.params.token;
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _a.sent();
                        entityManager = self.getManager();
                        return [4 /*yield*/, entityManager.findOneOrFail(verify_entity_1.Verify, { email: email })];
                    case 2:
                        verify = _a.sent();
                        verified = verify.compare(verify.token, decodeURIComponent(token));
                        if (!verified) {
                            res_7 = {
                                success: false,
                                message: "Token doesn't match"
                            };
                            return [2 /*return*/, response.status(400).json(res_7)];
                        }
                        filter = { email: email };
                        return [4 /*yield*/, entityManager.update(reseller_entity_1.Reseller, filter, { status: true })];
                    case 3:
                        reseller = _a.sent();
                        return [4 /*yield*/, entityManager.delete(verify_entity_1.Verify, { email: email })];
                    case 4:
                        _a.sent();
                        if (!reseller) {
                            res_8 = {
                                success: false,
                                message: "User not found"
                            };
                            return [2 /*return*/, response.status(400).json(res_8)];
                        }
                        res = {
                            message: "User has been verified, thanks"
                        };
                        connection.close();
                        return [2 /*return*/, response.status(200).json(res)];
                }
            });
        });
    };
    ResellerController.prototype.delete = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    ResellerController.prototype.generateqr = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var self, _a, email, opening, expire, code, ticket, fileLocation, fileName, connection, saved, file, template, compiled, mailer, options;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        self = this;
                        _a = request.body, email = _a.email, opening = _a.opening;
                        expire = new Date(moment_1.default().add(2, 'weeks').format());
                        code = new qr_code_1.QRCode().generate(email, expire);
                        ticket = new ticket_entity_1.Ticket();
                        ticket.code = code;
                        ticket.owner = email;
                        ticket.used = false;
                        ticket.opening = opening;
                        ticket.expire = expire;
                        fileLocation = 'dist/uploads/' + ticket.owner;
                        fileName = uuid_1.v4() + '.jpeg';
                        ticket.fullPath = "uploads/" + ticket.owner + '/' + fileName;
                        if (!fs_1.default.existsSync(fileLocation)) {
                            fs_1.default.mkdirSync(fileLocation);
                        }
                        return [4 /*yield*/, self.getConnection()];
                    case 1:
                        connection = _b.sent();
                        return [4 /*yield*/, ticket.save()];
                    case 2:
                        saved = _b.sent();
                        if (!saved) {
                            connection.close();
                            return [2 /*return*/, response.status(400).json({ message: "error_saving" })];
                        }
                        return [4 /*yield*/, qrcode_1.default.toFile(fileLocation + '/' + fileName, code, { errorCorrectionLevel: 'H' })];
                    case 3:
                        _b.sent();
                        file = fs_1.default.readFileSync('dist/templates/template.hbs', 'utf8');
                        template = handlebars_1.default.compile(file);
                        compiled = template({ "qr": saved.fullPath });
                        mailer = new mailer_1.Mailer();
                        options = {
                            from: '"NodeJS" <jcfernandez@jcdeveloper.net>',
                            to: email,
                            subject: 'Tu código QR',
                            html: compiled
                        };
                        connection.close();
                        return [4 /*yield*/, mailer.sendMail(options)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, response.status(200).json({ message: "ticket has been created" })];
                }
            });
        });
    };
    __decorate([
        core_1.Post('signin'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "signin", null);
    __decorate([
        core_1.Post('create'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "create", null);
    __decorate([
        core_1.Get('show'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "show", null);
    __decorate([
        core_1.Patch('update/:id'),
        core_1.Middleware([session_middleware_1.session]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "update", null);
    __decorate([
        core_1.Get('forgot/:email'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "forgot", null);
    __decorate([
        core_1.Get('reset/:email/:token'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "reset", null);
    __decorate([
        core_1.Post('password'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "password", null);
    __decorate([
        core_1.Get('verify/:email/:token'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "verify", null);
    __decorate([
        core_1.Delete('delete/:email'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "delete", null);
    __decorate([
        core_1.Post('generateqr'),
        core_1.Middleware([session_middleware_1.session]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", Promise)
    ], ResellerController.prototype, "generateqr", null);
    ResellerController = __decorate([
        core_1.Controller('api/reseller')
    ], ResellerController);
    return ResellerController;
}(base_controller_1.BaseController));
exports.ResellerController = ResellerController;
