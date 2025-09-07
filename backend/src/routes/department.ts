import { Router } from "express";
import * as departmentController from "../controllers/departmentController";
import { getDepartmentSubBatches } from "../controllers/departmentController";

const router = Router();

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);
router.get("/:id/sub-batches", getDepartmentSubBatches);

export default router;
