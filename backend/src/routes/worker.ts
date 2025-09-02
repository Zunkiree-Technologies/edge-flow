import { Router } from "express";
import * as workerController from "../controllers/workerController";

const router = Router();

router.post("/", workerController.createWorker); // Create
router.get("/", workerController.getAllWorkers); // Read all
router.get("/:id", workerController.getWorkerById); // Read one
router.put("/:id", workerController.updateWorker); // Update
router.delete("/:id", workerController.deleteWorker); // Delete

export default router;
