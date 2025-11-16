"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlteredBySubBatch = exports.getAllAlteredSubBatches = exports.createAlteredSubBatch = exports.DepartmentStage = void 0;
// src/services/subBatchAltered.ts
const db_1 = __importDefault(require("../config/db"));
var DepartmentStage;
(function (DepartmentStage) {
    DepartmentStage["NEW_ARRIVAL"] = "NEW_ARRIVAL";
    DepartmentStage["IN_PROGRESS"] = "IN_PROGRESS";
    DepartmentStage["COMPLETED"] = "COMPLETED";
})(DepartmentStage || (exports.DepartmentStage = DepartmentStage = {}));
const createAlteredSubBatch = async (data) => {
    return await db_1.default.$transaction(async (tx) => {
        // 1️⃣ Verify source entry exists and has sufficient quantity
        const sourceEntry = await tx.department_sub_batches.findUnique({
            where: { id: data.source_department_sub_batch_id },
        });
        if (!sourceEntry) {
            throw new Error(`Source department_sub_batch entry ${data.source_department_sub_batch_id} not found`);
        }
        if (!sourceEntry.is_current) {
            throw new Error(`Source entry ${data.source_department_sub_batch_id} is not active`);
        }
        if ((sourceEntry.quantity_remaining || 0) < data.quantity) {
            throw new Error(`Insufficient quantity in source entry. Available: ${sourceEntry.quantity_remaining}, requested: ${data.quantity}`);
        }
        // 2️⃣ Reduce quantity_remaining from SPECIFIC entry (not all entries)
        await tx.department_sub_batches.update({
            where: {
                id: data.source_department_sub_batch_id,
            },
            data: {
                quantity_remaining: { decrement: data.quantity },
            },
        });
        // 3️⃣ Add to department_sub_batches for target department
        const deptSubBatch = await tx.department_sub_batches.create({
            data: {
                sub_batch_id: data.sub_batch_id,
                department_id: data.target_department_id,
                stage: DepartmentStage.NEW_ARRIVAL,
                is_current: true,
                quantity_remaining: data.quantity, // only altered quantity
                total_quantity: sourceEntry.total_quantity, // Copy the original total quantity
                remarks: "Altered",
                alter_reason: data.reason, // ✅ Store alter reason
                sent_from_department: sourceEntry.department_id, // ✅ Track which department it came from
            },
        });
        // 4️⃣ Create altered record with BOTH source and created IDs
        const altered = await tx.sub_batch_altered.create({
            data: {
                sub_batch_id: data.sub_batch_id,
                quantity: data.quantity,
                sent_to_department_id: data.target_department_id,
                reason: data.reason,
                worker_log_id: data.worker_log_id ?? null,
                source_department_sub_batch_id: data.source_department_sub_batch_id, // ✅ Store source entry
                created_department_sub_batch_id: deptSubBatch.id, // ✅ Store created entry
            },
        });
        // 5️⃣ Log history
        await tx.department_sub_batch_history.create({
            data: {
                department_sub_batch_id: deptSubBatch.id,
                sub_batch_id: data.sub_batch_id,
                to_stage: DepartmentStage.NEW_ARRIVAL,
                to_department_id: data.target_department_id,
                reason: data.reason,
            },
        });
        return altered;
    });
};
exports.createAlteredSubBatch = createAlteredSubBatch;
// ✅ Fetch all altered sub-batches with related data
const getAllAlteredSubBatches = async () => {
    return await db_1.default.sub_batch_altered.findMany({
        include: {
            sub_batch: true,
            sent_to_department: true,
            worker_log: true, // fetch linked worker log if available
        },
    });
};
exports.getAllAlteredSubBatches = getAllAlteredSubBatches;
// ✅ Fetch altered sub-batches by Sub-Batch ID
const getAlteredBySubBatch = async (sub_batch_id) => {
    return await db_1.default.sub_batch_altered.findMany({
        where: { sub_batch_id },
        include: {
            sub_batch: true,
            sent_to_department: true,
            worker_log: true,
        },
    });
};
exports.getAlteredBySubBatch = getAlteredBySubBatch;
