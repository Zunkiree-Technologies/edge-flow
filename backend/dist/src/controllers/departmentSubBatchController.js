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
exports.assignWorkerToDepartmentSubBatch = exports.getSubBatchHistory = exports.getAllDepartmentSubBatchHistory = exports.getAllEntriesForSubBatch = exports.getAllDepartmentSubBatches = void 0;
const departmentSubBatchService = __importStar(require("../services/departmentSubBatchService"));
// Get all department_sub_batches entries (all sub-batches)
const getAllDepartmentSubBatches = async (req, res) => {
    try {
        const entries = await departmentSubBatchService.getAllDepartmentSubBatches();
        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Error fetching all department sub-batches",
        });
    }
};
exports.getAllDepartmentSubBatches = getAllDepartmentSubBatches;
// Get all department_sub_batches entries for a specific sub-batch
const getAllEntriesForSubBatch = async (req, res) => {
    try {
        const subBatchId = Number(req.params.subBatchId);
        if (isNaN(subBatchId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub-batch ID",
            });
        }
        const entries = await departmentSubBatchService.getAllEntriesForSubBatch(subBatchId);
        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Error fetching department entries",
        });
    }
};
exports.getAllEntriesForSubBatch = getAllEntriesForSubBatch;
// Get all department_sub_batch_history entries
const getAllDepartmentSubBatchHistory = async (req, res) => {
    try {
        const history = await departmentSubBatchService.getAllDepartmentSubBatchHistory();
        res.status(200).json({
            success: true,
            count: history.length,
            data: history,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Error fetching department sub-batch history",
        });
    }
};
exports.getAllDepartmentSubBatchHistory = getAllDepartmentSubBatchHistory;
// Get sub-batch history (completed departments with worker logs)
const getSubBatchHistory = async (req, res) => {
    try {
        const subBatchId = Number(req.params.subBatchId);
        if (isNaN(subBatchId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sub-batch ID",
            });
        }
        const history = await departmentSubBatchService.getSubBatchHistory(subBatchId);
        res.status(200).json({
            success: true,
            sub_batch_id: subBatchId,
            completed_departments_count: history.department_details.length,
            department_flow: history.department_flow,
            department_details: history.department_details,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Error fetching sub-batch history",
        });
    }
};
exports.getSubBatchHistory = getSubBatchHistory;
// ✅ Assign worker to a department_sub_batch entry
const assignWorkerToDepartmentSubBatch = async (req, res) => {
    try {
        const { departmentSubBatchId, workerId } = req.body;
        if (!departmentSubBatchId) {
            return res.status(400).json({
                success: false,
                message: "departmentSubBatchId is required",
            });
        }
        // workerId can be null (to unassign), so we only check if it's provided
        if (workerId !== null && workerId !== undefined && typeof workerId !== 'number') {
            return res.status(400).json({
                success: false,
                message: "workerId must be a number or null",
            });
        }
        const updated = await departmentSubBatchService.assignWorkerToDepartmentSubBatch(Number(departmentSubBatchId), workerId === null ? null : Number(workerId));
        res.status(200).json({
            success: true,
            message: workerId ? "Worker assigned successfully" : "Worker unassigned successfully",
            data: updated,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Error assigning worker",
        });
    }
};
exports.assignWorkerToDepartmentSubBatch = assignWorkerToDepartmentSubBatch;
