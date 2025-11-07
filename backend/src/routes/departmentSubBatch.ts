// src/routes/departmentSubBatch.ts
import { Router } from "express";
import * as departmentSubBatchController from "../controllers/departmentSubBatchController";

const router = Router();

// Get all department_sub_batches entries for a specific sub-batch
router.get("/sub-batch/:subBatchId", departmentSubBatchController.getAllEntriesForSubBatch);

export default router;
