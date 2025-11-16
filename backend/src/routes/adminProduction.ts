// src/routes/adminProduction.ts
import { Router } from "express";
import * as adminProductionController from "../controllers/adminProductionController";

const router = Router();

// Get task details for admin production view
// GET /api/admin/production/task-details/:subBatchId?department_id={departmentId}
router.get("/task-details/:subBatchId", adminProductionController.getTaskDetails);

// Reject sub-batch from admin production view
// POST /api/admin/production/reject
router.post("/reject", adminProductionController.rejectSubBatch);

// Add alteration from admin production view
// POST /api/admin/production/alteration
router.post("/alteration", adminProductionController.addAlteration);

export default router;
