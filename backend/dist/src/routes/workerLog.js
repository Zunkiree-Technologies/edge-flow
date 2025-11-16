"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/workerLogRoutes.ts
const express_1 = require("express");
const workerLogController_1 = require("../controllers/workerLogController");
const router = (0, express_1.Router)();
// CRUD routes
router.post("/logs", workerLogController_1.createWorkerLogController);
router.get("/logs", workerLogController_1.getAllWorkerLogsController);
router.get("/logs/:id", workerLogController_1.getWorkerLogByIdController);
router.put("/logs/:id", workerLogController_1.updateWorkerLogController);
router.delete("/logs/:id", workerLogController_1.deleteWorkerLogController);
// GET /api/worker-logs/:subBatchId
router.get("/:subBatchId", workerLogController_1.getWorkerLogsBySubBatch);
exports.default = router;
