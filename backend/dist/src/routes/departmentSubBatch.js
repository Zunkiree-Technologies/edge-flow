"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/departmentSubBatch.ts
const express_1 = require("express");
const departmentSubBatchController = __importStar(require("../controllers/departmentSubBatchController"));
const router = (0, express_1.Router)();
// Get all department_sub_batches entries (all sub-batches)
router.get("/all", departmentSubBatchController.getAllDepartmentSubBatches);
// Get all department_sub_batch_history entries
router.get("/history", departmentSubBatchController.getAllDepartmentSubBatchHistory);
// Get sub-batch history (completed departments with worker logs)
router.get("/sub-batch-history/:subBatchId", departmentSubBatchController.getSubBatchHistory);
// Get all department_sub_batches entries for a specific sub-batch
router.get("/sub-batch/:subBatchId", departmentSubBatchController.getAllEntriesForSubBatch);
// ✅ Assign worker to a department_sub_batch entry
router.put("/assign-worker", departmentSubBatchController.assignWorkerToDepartmentSubBatch);
exports.default = router;
