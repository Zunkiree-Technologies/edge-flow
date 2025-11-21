// src/routes/departmentSubBatch.ts
import { Router } from "express";
import * as departmentSubBatchController from "../controllers/departmentSubBatchController";

const router = Router();

// Get all department_sub_batches entries (all sub-batches)
router.get("/all", departmentSubBatchController.getAllDepartmentSubBatches);

// Get all department_sub_batch_history entries
router.get("/history", departmentSubBatchController.getAllDepartmentSubBatchHistory);

// Get sub-batch history (completed departments with worker logs)
router.get("/sub-batch-history/:subBatchId", departmentSubBatchController.getSubBatchHistory);

// Get all department_sub_batches entries for a specific sub-batch
router.get("/sub-batch/:subBatchId", departmentSubBatchController.getAllEntriesForSubBatch);

// ✅ Assign worker to a department_sub_batch entry
router.put("/assign-worker", departmentSubBatchController.assignWorkerToDepartmentSubBatch);

// ==================== NEW WORKFLOW ROUTES ====================

// Create initial parent card when sub-batch arrives at department
router.post("/receive", departmentSubBatchController.createParentCardController);

// Assign pieces from parent to worker (create child)
router.post("/:parentId/assign", departmentSubBatchController.assignPiecesToWorkerController);

// Update child work (worked and altered)
router.patch("/child/:childId/work", departmentSubBatchController.updateChildWorkController);

// Forward child to next department
router.post("/child/:childId/forward", departmentSubBatchController.forwardChildController);

// Delete child and restore parent
router.delete("/child/:childId", departmentSubBatchController.deleteChildController);

// Get department cards (parent and children)
router.get("/department/:deptId/sub-batch/:subBatchId/cards", departmentSubBatchController.getDepartmentCardsController);

export default router;
