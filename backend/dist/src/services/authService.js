"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSupervisor = exports.loginUser = exports.signupUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
// Admin Signup
const signupUser = async (email, password) => {
    const existingUser = await db_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error("User already exists");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await db_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            role: "ADMIN", // added role here
        },
    });
    const token = (0, jwt_1.generateToken)(user.id, "ADMIN");
    return { user: { ...user, role: "ADMIN" }, token };
};
exports.signupUser = signupUser;
// Admin Login
const loginUser = async (email, password) => {
    const user = await db_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Invalid email or password");
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid email or password");
    const token = (0, jwt_1.generateToken)(user.id, "ADMIN");
    return { user: { ...user, role: user.role }, token };
};
exports.loginUser = loginUser;
// Supervisor Login
const loginSupervisor = async (email, password) => {
    const supervisor = await db_1.default.supervisor.findUnique({ where: { email } });
    if (!supervisor)
        throw new Error("Invalid email or password");
    const isMatch = await bcrypt_1.default.compare(password, supervisor.password);
    if (!isMatch)
        throw new Error("Invalid email or password");
    const token = (0, jwt_1.generateToken)(supervisor.id, "SUPERVISOR", supervisor.departmentId ?? undefined);
    return { supervisor: { ...supervisor, role: "SUPERVISOR" }, token };
};
exports.loginSupervisor = loginSupervisor;
