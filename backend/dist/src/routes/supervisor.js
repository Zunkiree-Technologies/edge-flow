"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supervisorController_1 = require("../controllers/supervisorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const supervisorController_2 = require("../controllers/supervisorController");
const supervisorController_3 = require("../controllers/supervisorController");
const supervisorController_4 = require("../controllers/supervisorController");
const router = (0, express_1.Router)();
// Only ADMIN can create supervisors
router.post("/", authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)("ADMIN"), supervisorController_1.createSupervisor);
// Only ADMIN can assign/reassign departments
router.patch("/assign-department", authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)("ADMIN"), supervisorController_1.assignDepartment);
router.get("/", supervisorController_1.getSupervisors); // ✅ new GET endpoint
// Only ADMIN can delete supervisor
router.delete("/:id", supervisorController_3.deleteSupervisor);
// Only ADMIN can update supervisor
router.put("/:id", supervisorController_2.updateSupervisorController);
// Endpoint for supervisor to get sub-batches of their department
router.get("/sub-batches", authMiddleware_1.authMiddleware, (0, authMiddleware_1.requireRole)("SUPERVISOR"), // only supervisors can access
supervisorController_4.getSupervisorSubBatches);
exports.default = router;
