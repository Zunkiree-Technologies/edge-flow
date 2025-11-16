"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/productionView.ts
const express_1 = require("express");
const productionViewController_1 = require("../controllers/productionViewController");
const router = (0, express_1.Router)();
/**
 * GET /api/production-view
 * Get all production view data organized by departments
 *
 * Query parameters (optional):
 * - start_date: Filter by start date (YYYY-MM-DD)
 * - end_date: Filter by end date (YYYY-MM-DD)
 * - department_id: Filter by specific department
 */
router.get("/", productionViewController_1.getProductionView);
exports.default = router;
