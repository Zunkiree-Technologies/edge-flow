"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subBatchWorkflowController_1 = require("../controllers/subBatchWorkflowController");
const router = (0, express_1.Router)();
// GET workflow status for a sub-batch
router.get("/:subBatchId/status", subBatchWorkflowController_1.getWorkflowStatus);
exports.default = router;
