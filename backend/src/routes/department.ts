import { Router } from "express";
import * as departmentController from "../controllers/departmentController";
import { getDepartmentSubBatches } from "../controllers/departmentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);
router.get("/:id/sub-batches", authMiddleware, getDepartmentSubBatches);

export default router;
