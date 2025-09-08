import { Router } from "express";
import { createSupervisor } from "../controllers/supervisorController";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Only ADMIN can create supervisors
router.post("/", authMiddleware, requireRole("ADMIN"), createSupervisor);

export default router;
