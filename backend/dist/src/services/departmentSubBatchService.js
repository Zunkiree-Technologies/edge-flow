"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignWorkerToDepartmentSubBatch = exports.getSubBatchHistory = exports.getAllDepartmentSubBatchHistory = exports.getAllEntriesForSubBatch = exports.getAllDepartmentSubBatches = void 0;
// src/services/departmentSubBatchService.ts
const db_1 = __importDefault(require("../config/db"));
// Get all department_sub_batches entries (all sub-batches)
const getAllDepartmentSubBatches = async () => {
    const entries = await db_1.default.department_sub_batches.findMany({
        include: {
            department: true,
            sub_batch: true,
            assigned_worker: true,
        },
        orderBy: [
            { createdAt: 'desc' },
        ],
    });
    return entries;
};
exports.getAllDepartmentSubBatches = getAllDepartmentSubBatches;
// Get all department_sub_batches entries for a specific sub-batch
// This shows all workflows (main, rejected, altered) for a sub-batch
const getAllEntriesForSubBatch = async (subBatchId) => {
    const entries = await db_1.default.department_sub_batches.findMany({
        where: {
            sub_batch_id: subBatchId,
        },
        include: {
            department: true,
        },
        orderBy: [
            { is_current: 'desc' }, // Show active entries first
            { createdAt: 'desc' },
        ],
    });
    return entries;
};
exports.getAllEntriesForSubBatch = getAllEntriesForSubBatch;
// Get all department_sub_batch_history entries (for analysis)
const getAllDepartmentSubBatchHistory = async () => {
    const history = await db_1.default.department_sub_batch_history.findMany({
        include: {
            department_sub_batch: {
                include: {
                    department: true,
                    sub_batch: true,
                },
            },
        },
        orderBy: [
            { createdAt: 'desc' },
        ],
    });
    return history;
};
exports.getAllDepartmentSubBatchHistory = getAllDepartmentSubBatchHistory;
// Get sub-batch history: departments where work was completed
const getSubBatchHistory = async (subBatchId) => {
    // Get the planned workflow for this sub-batch
    const workflow = await db_1.default.sub_batch_workflows.findUnique({
        where: {
            sub_batch_id: subBatchId,
        },
        include: {
            steps: {
                include: {
                    department: true,
                },
                orderBy: {
                    step_index: 'asc',
                },
            },
        },
    });
    // Build complete planned department flow
    let departmentFlow = '';
    if (workflow && workflow.steps.length > 0) {
        const plannedDepartments = workflow.steps.map(step => step.department?.name || 'Unknown');
        departmentFlow = plannedDepartments.join(' → ');
    }
    // Get all department entries where work was completed (sent to another department)
    const completedDepartments = await db_1.default.department_sub_batches.findMany({
        where: {
            sub_batch_id: subBatchId,
            sent_to_department_id: { not: null }, // Only entries where work was completed
        },
        include: {
            department: true,
            sent_to_department: true,
        },
        orderBy: [
            { createdAt: 'asc' }, // Chronological order
        ],
    });
    // For each department, fetch worker logs
    const departmentDetails = await Promise.all(completedDepartments.map(async (deptEntry) => {
        const workerLogs = await db_1.default.worker_logs.findMany({
            where: {
                sub_batch_id: subBatchId,
                department_id: deptEntry.department_id,
            },
            include: {
                worker: true,
                rejected_entry: {
                    include: {
                        sent_to_department: true,
                    },
                },
                altered_entry: {
                    include: {
                        sent_to_department: true,
                    },
                },
            },
            orderBy: {
                work_date: 'asc',
            },
        });
        return {
            department_entry_id: deptEntry.id,
            department_id: deptEntry.department_id,
            department_name: deptEntry.department?.name,
            sent_to_department_id: deptEntry.sent_to_department_id,
            sent_to_department_name: deptEntry.sent_to_department?.name,
            arrival_date: deptEntry.createdAt,
            quantity_remaining: deptEntry.quantity_remaining,
            remarks: deptEntry.remarks,
            worker_logs: workerLogs.map((log) => ({
                id: log.id,
                worker_id: log.worker_id,
                worker_name: log.worker_name || log.worker?.name,
                work_date: log.work_date,
                size_category: log.size_category,
                particulars: log.particulars,
                quantity_received: log.quantity_received,
                quantity_worked: log.quantity_worked,
                unit_price: log.unit_price,
                activity_type: log.activity_type,
                rejected: log.rejected_entry?.map((r) => ({
                    quantity: r.quantity,
                    reason: r.reason,
                    sent_to_department_id: r.sent_to_department_id,
                    sent_to_department_name: r.sent_to_department?.name,
                })),
                altered: log.altered_entry?.map((a) => ({
                    quantity: a.quantity,
                    reason: a.reason,
                    sent_to_department_id: a.sent_to_department_id,
                    sent_to_department_name: a.sent_to_department?.name,
                })),
            })),
        };
    }));
    return {
        department_flow: departmentFlow,
        department_details: departmentDetails,
    };
};
exports.getSubBatchHistory = getSubBatchHistory;
// ✅ Assign worker to a department_sub_batch entry
const assignWorkerToDepartmentSubBatch = async (departmentSubBatchId, workerId) => {
    // Verify the department_sub_batch exists
    const deptSubBatch = await db_1.default.department_sub_batches.findUnique({
        where: { id: departmentSubBatchId },
    });
    if (!deptSubBatch) {
        throw new Error(`Department sub-batch with id ${departmentSubBatchId} not found`);
    }
    // If workerId is provided, verify the worker exists
    if (workerId !== null) {
        const worker = await db_1.default.workers.findUnique({
            where: { id: workerId },
        });
        if (!worker) {
            throw new Error(`Worker with id ${workerId} not found`);
        }
    }
    // Update the assigned_worker_id
    const updated = await db_1.default.department_sub_batches.update({
        where: { id: departmentSubBatchId },
        data: {
            assigned_worker_id: workerId,
        },
        include: {
            assigned_worker: true,
            department: true,
            sub_batch: true,
        },
    });
    return updated;
};
exports.assignWorkerToDepartmentSubBatch = assignWorkerToDepartmentSubBatch;
