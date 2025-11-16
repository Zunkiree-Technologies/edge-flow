"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/wage.ts
const express_1 = __importDefault(require("express"));
const wageController_1 = require("../controllers/wageController");
const router = express_1.default.Router();
/**
 * Wage Calculation Routes
 *
 * These endpoints calculate wages based on worker_logs data,
 * filtering by is_billable flag to exclude rework on rejected pieces.
 */
// Get wages for a specific worker
// GET /api/wages/worker/:workerId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/worker/:workerId", wageController_1.getWorkerWages);
// Get wages for all workers
// GET /api/wages/all?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&department_id=X
router.get("/all", wageController_1.getAllWorkersWages);
// Get only billable work logs
// GET /api/wages/billable?worker_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/billable", wageController_1.getBillableLogs);
// Get department wage summary
// GET /api/wages/department/:departmentId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/department/:departmentId", wageController_1.getDepartmentWages);
// Get sub-batch wage summary
// GET /api/wages/sub-batch/:subBatchId
router.get("/sub-batch/:subBatchId", wageController_1.getSubBatchWages);
exports.default = router;
