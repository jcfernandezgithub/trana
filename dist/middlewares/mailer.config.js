"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var nodemailer_1 = __importDefault(require("nodemailer"));
var handlebars = require('nodemailer-express-handlebars');
var transporter = nodemailer_1.default.createTransport({
    host: 'smtp.hostinger.com.ar',
    port: 587,
    auth: {
        user: 'jcfernandez@jcdeveloper.net',
        pass: '123456'
    }
});
var hbsOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path_1.default.resolve('./src/templates/'),
        layoutsDir: path_1.default.resolve('./src/templates/'),
        defaultLayout: 'confirm.hbs',
    },
    viewPath: path_1.default.resolve('./src/templates/'),
    extName: '.hbs',
};
transporter.use('compile', handlebars(hbsOptions));
function sendEmail(options) {
    return transporter.sendMail(options);
}
exports.sendEmail = sendEmail;
