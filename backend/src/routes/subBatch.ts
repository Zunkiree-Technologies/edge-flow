// src/routes/subBatchRoutes.ts
import { Router } from "express";
import * as subBatchController from "../controllers/subBatchController";

const router = Router();

router.post("/", subBatchController.createSubBatch);
router.get("/", subBatchController.getAllSubBatches);
router.get("/:id", subBatchController.getSubBatchById);
router.put("/:id", subBatchController.updateSubBatch);
router.delete("/:id", subBatchController.deleteSubBatch);

export default router;
