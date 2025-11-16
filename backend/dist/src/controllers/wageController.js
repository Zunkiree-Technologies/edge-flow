"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubBatchWages = exports.getDepartmentWages = exports.getBillableLogs = exports.getAllWorkersWages = exports.getWorkerWages = void 0;
const wageService_1 = require("../services/wageService");
/**
 * GET /api/wages/worker/:workerId
 * Calculate wages for a specific worker
 * Query params: start_date, end_date (optional)
 */
const getWorkerWages = async (req, res) => {
    try {
        const workerId = parseInt(req.params.workerId);
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        if (isNaN(workerId)) {
            return res.status(400).json({ error: "Invalid worker ID" });
        }
        // Validate dates
        if (startDate && isNaN(startDate.getTime())) {
            return res.status(400).json({ error: "Invalid start_date format" });
        }
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid end_date format" });
        }
        const wageReport = await (0, wageService_1.calculateWorkerWages)(workerId, startDate, endDate);
        res.json(wageReport);
    }
    catch (error) {
        console.error("Error calculating worker wages:", error);
        res.status(500).json({ error: error.message || "Failed to calculate wages" });
    }
};
exports.getWorkerWages = getWorkerWages;
/**
 * GET /api/wages/all
 * Calculate wages for all workers
 * Query params: start_date, end_date, department_id (optional)
 */
const getAllWorkersWages = async (req, res) => {
    try {
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        const departmentId = req.query.department_id
            ? parseInt(req.query.department_id)
            : undefined;
        // Validate dates
        if (startDate && isNaN(startDate.getTime())) {
            return res.status(400).json({ error: "Invalid start_date format" });
        }
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid end_date format" });
        }
        if (departmentId && isNaN(departmentId)) {
            return res.status(400).json({ error: "Invalid department_id" });
        }
        const wages = await (0, wageService_1.calculateAllWorkersWages)(startDate, endDate, departmentId);
        res.json(wages);
    }
    catch (error) {
        console.error("Error calculating all workers wages:", error);
        res.status(500).json({ error: error.message || "Failed to calculate wages" });
    }
};
exports.getAllWorkersWages = getAllWorkersWages;
/**
 * GET /api/wages/billable
 * Get only billable work logs
 * Query params: worker_id, start_date, end_date (optional)
 */
const getBillableLogs = async (req, res) => {
    try {
        const workerId = req.query.worker_id
            ? parseInt(req.query.worker_id)
            : undefined;
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        // Validate inputs
        if (workerId && isNaN(workerId)) {
            return res.status(400).json({ error: "Invalid worker_id" });
        }
        if (startDate && isNaN(startDate.getTime())) {
            return res.status(400).json({ error: "Invalid start_date format" });
        }
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid end_date format" });
        }
        const logs = await (0, wageService_1.getBillableWorkLogs)(workerId, startDate, endDate);
        res.json(logs);
    }
    catch (error) {
        console.error("Error fetching billable logs:", error);
        res.status(500).json({ error: error.message || "Failed to fetch billable logs" });
    }
};
exports.getBillableLogs = getBillableLogs;
/**
 * GET /api/wages/department/:departmentId
 * Get wage summary for a department
 * Query params: start_date, end_date (optional)
 */
const getDepartmentWages = async (req, res) => {
    try {
        const departmentId = parseInt(req.params.departmentId);
        const startDate = req.query.start_date
            ? new Date(req.query.start_date)
            : undefined;
        const endDate = req.query.end_date
            ? new Date(req.query.end_date)
            : undefined;
        if (isNaN(departmentId)) {
            return res.status(400).json({ error: "Invalid department ID" });
        }
        // Validate dates
        if (startDate && isNaN(startDate.getTime())) {
            return res.status(400).json({ error: "Invalid start_date format" });
        }
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid end_date format" });
        }
        const summary = await (0, wageService_1.getDepartmentWageSummary)(departmentId, startDate, endDate);
        res.json(summary);
    }
    catch (error) {
        console.error("Error calculating department wages:", error);
        res.status(500).json({ error: error.message || "Failed to calculate department wages" });
    }
};
exports.getDepartmentWages = getDepartmentWages;
/**
 * GET /api/wages/sub-batch/:subBatchId
 * Get wage summary for a sub-batch
 */
const getSubBatchWages = async (req, res) => {
    try {
        const subBatchId = parseInt(req.params.subBatchId);
        if (isNaN(subBatchId)) {
            return res.status(400).json({ error: "Invalid sub-batch ID" });
        }
        const summary = await (0, wageService_1.getSubBatchWageSummary)(subBatchId);
        res.json(summary);
    }
    catch (error) {
        console.error("Error calculating sub-batch wages:", error);
        res.status(500).json({ error: error.message || "Failed to calculate sub-batch wages" });
    }
};
exports.getSubBatchWages = getSubBatchWages;
