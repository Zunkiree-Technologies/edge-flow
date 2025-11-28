// src/routes/batchRoutes.ts
import express from "express";
import * as batchController from "../controllers/batchController";

const router = express.Router();

router.post("/", batchController.createBatch);
router.get("/", batchController.getBatches);
router.post("/check-dependencies", batchController.checkDependencies); // Must be before /:id routes
router.get("/:id", batchController.getBatchById);
router.put("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);

export default router;
