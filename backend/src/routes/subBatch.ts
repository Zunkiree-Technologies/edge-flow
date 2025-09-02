import express from "express";
import {
  createSubBatch,
  getAllSubBatches,
  getSubBatchById,
  updateSubBatch,
  deleteSubBatch,
} from "../controllers/subBatchController";

const router = express.Router();

router.post("/", createSubBatch);
router.get("/", getAllSubBatches);
router.get("/:id", getSubBatchById);
router.put("/:id", updateSubBatch);
router.delete("/:id", deleteSubBatch);

export default router;
