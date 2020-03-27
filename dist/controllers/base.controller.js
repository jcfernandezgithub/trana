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
Object.defineProperty(exports, "__esModule", { value: true });
var database_class_1 = require("../database/database.class");
var BaseController = /** @class */ (function (_super) {
    __extends(BaseController, _super);
    function BaseController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BaseController;
}(database_class_1.Database));
exports.BaseController = BaseController;
