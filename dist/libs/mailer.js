"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer_1 = __importDefault(require("nodemailer"));
var Mailer = /** @class */ (function () {
    function Mailer() {
        this.transporter = nodemailer_1.default.createTransport({
            host: 'smtp.hostinger.com.ar',
            port: 587,
            secure: false,
            auth: {
                user: 'jcfernandez@jcdeveloper.net',
                pass: '123456'
            }
        });
    }
    Mailer.prototype.sendMail = function (options) {
        var self = this;
        return self.transporter.sendMail(options);
    };
    return Mailer;
}());
exports.Mailer = Mailer;
