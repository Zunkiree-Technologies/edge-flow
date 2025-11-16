"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Compare plain password with hashed password
const comparePassword = async (plain, hashed) => {
    return await bcrypt_1.default.compare(plain, hashed);
};
exports.comparePassword = comparePassword;
