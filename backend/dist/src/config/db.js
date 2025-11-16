"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentStage = exports.Prisma = void 0;
// src/config/db.ts
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "Prisma", { enumerable: true, get: function () { return client_1.Prisma; } });
// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
// Export the prisma instance as default
exports.default = prisma;
// Export enums if you have any
var client_2 = require("@prisma/client"); // if this exists in your schema
Object.defineProperty(exports, "DepartmentStage", { enumerable: true, get: function () { return client_2.DepartmentStage; } });
