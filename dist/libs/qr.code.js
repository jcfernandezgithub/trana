"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var QRCode = /** @class */ (function () {
    function QRCode() {
    }
    QRCode.prototype.generate = function (email, expire) {
        return jsonwebtoken_1.default.sign({ email: email, expire: expire }, process.env.key || 'qr_code_key');
    };
    return QRCode;
}());
exports.QRCode = QRCode;
