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
exports.getCompleted = exports.getByStatus = exports.markAsCompleted = exports.advanceDepartment = exports.moveStage = exports.sendSubBatchToProduction = exports.deleteSubBatch = exports.updateSubBatch = exports.getSubBatchById = exports.getAllSubBatches = exports.createSubBatch = void 0;
const subBatchService = __importStar(require("../services/subBatchService"));
const subBatchService_1 = require("../services/subBatchService");
const subBatchService_2 = require("../services/subBatchService");
// Create Sub-Batch
const createSubBatch = async (req, res) => {
    try {
        const result = await subBatchService.createSubBatch(req.body);
        res.status(201).json(result);
    }
    catch (err) {
        res
            .status(400)
            .json({
            message: "Error creating sub-batch",
            details: err.message || err,
        });
    }
};
exports.createSubBatch = createSubBatch;
// Get all Sub-Batches
const getAllSubBatches = async (_req, res) => {
    try {
        const subBatches = await subBatchService.getAllSubBatches();
        res.json(subBatches);
    }
    catch (err) {
        res
            .status(500)
            .json({
            message: "Error fetching sub-batches",
            details: err.message || err,
        });
    }
};
exports.getAllSubBatches = getAllSubBatches;
// Get Sub-Batch by ID
const getSubBatchById = async (req, res) => {
    try {
        const subBatch = await subBatchService.getSubBatchById(Number(req.params.id));
        res.json(subBatch);
    }
    catch (err) {
        res
            .status(404)
            .json({ message: "Sub-batch not found", details: err.message || err });
    }
};
exports.getSubBatchById = getSubBatchById;
// Update Sub-Batch
const updateSubBatch = async (req, res) => {
    try {
        const result = await subBatchService.updateSubBatch(Number(req.params.id), req.body);
        res.json(result);
    }
    catch (err) {
        res
            .status(400)
            .json({
            message: "Error updating sub-batch",
            details: err.message || err,
        });
    }
};
exports.updateSubBatch = updateSubBatch;
// Delete Sub-Batch
const deleteSubBatch = async (req, res) => {
    try {
        const result = await subBatchService.deleteSubBatch(Number(req.params.id));
        res.json(result);
    }
    catch (err) {
        res
            .status(400)
            .json({
            message: "Error deleting sub-batch",
            details: err.message || err,
        });
    }
};
exports.deleteSubBatch = deleteSubBatch;
// Send Sub-Batch to Production (template or manual)
const sendSubBatchToProduction = async (req, res) => {
    try {
        const { subBatchId, workflowTemplateId, manualDepartments } = req.body;
        // Pass both to service
        const workflow = await (0, subBatchService_1.sendToProduction)(subBatchId, manualDepartments);
        res.status(200).json({ success: true, workflow });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.sendSubBatchToProduction = sendSubBatchToProduction;
// Move stage within Kanban
const moveStage = async (req, res) => {
    try {
        const { departmentSubBatchId, toStage } = req.body;
        const updated = await (0, subBatchService_2.moveSubBatchStage)(departmentSubBatchId, toStage);
        res.status(200).json({ success: true, updated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.moveStage = moveStage;
// Advance to next department
const advanceDepartment = async (req, res) => {
    try {
        const { departmentSubBatchId, toDepartmentId, quantityBeingSent } = req.body;
        if (!departmentSubBatchId || !toDepartmentId || !quantityBeingSent) {
            return res.status(400).json({
                success: false,
                message: "departmentSubBatchId, toDepartmentId, and quantityBeingSent are required"
            });
        }
        if (typeof quantityBeingSent !== 'number' || quantityBeingSent <= 0) {
            return res.status(400).json({
                success: false,
                message: "quantityBeingSent must be a positive number"
            });
        }
        const nextDept = await (0, subBatchService_2.advanceSubBatchToNextDepartment)(departmentSubBatchId, toDepartmentId, quantityBeingSent);
        res.status(200).json({ success: true, nextDept });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.advanceDepartment = advanceDepartment;
// Mark sub-batch as completed
const markAsCompleted = async (req, res) => {
    try {
        const { subBatchId } = req.body;
        if (!subBatchId) {
            return res.status(400).json({
                success: false,
                message: "subBatchId is required"
            });
        }
        const completedSubBatch = await (0, subBatchService_2.markSubBatchAsCompleted)(Number(subBatchId));
        res.status(200).json({
            success: true,
            message: "Sub-batch marked as completed",
            subBatch: completedSubBatch
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.markAsCompleted = markAsCompleted;
// Get sub-batches by status
const getByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        if (!['DRAFT', 'IN_PRODUCTION', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be DRAFT, IN_PRODUCTION, COMPLETED, or CANCELLED"
            });
        }
        const subBatches = await (0, subBatchService_2.getSubBatchesByStatus)(status);
        res.status(200).json({
            success: true,
            count: subBatches.length,
            subBatches
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getByStatus = getByStatus;
// Get completed sub-batches with optional date filtering
const getCompleted = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const startDate = start_date ? new Date(start_date) : undefined;
        const endDate = end_date ? new Date(end_date) : undefined;
        const completedSubBatches = await (0, subBatchService_2.getCompletedSubBatches)(startDate, endDate);
        res.status(200).json({
            success: true,
            count: completedSubBatches.length,
            subBatches: completedSubBatches
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getCompleted = getCompleted;
