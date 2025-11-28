// src/routes/productionView.ts
import { Router } from "express";
import { getProductionView } from "../controllers/productionViewController";

const router = Router();

/**
 * GET /api/production-view
 * Get all production view data organized by departments
 *
 * Query parameters (optional):
 * - start_date: Filter by start date (YYYY-MM-DD)
 * - end_date: Filter by end date (YYYY-MM-DD)
 * - department_id: Filter by specific department
 */
router.get("/", getProductionView);

export default router;
