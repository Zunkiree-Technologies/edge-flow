"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const start = Date.now();
        // Simple query: just count users (lightweight, no heavy join)
        await db_1.default.user.count();
        const duration = Date.now() - start;
        res.json({
            status: "ok",
            dbQueryTimeMs: duration,
            time: new Date().toISOString(),
        });
    }
    catch (err) {
        console.error("❌ Health DB check failed:", err);
        res.status(500).json({ status: "error", error: err });
    }
});
exports.default = router;
