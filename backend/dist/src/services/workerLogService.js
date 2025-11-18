"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerLogsBySubBatch = exports.deleteWorkerLog = exports.updateWorkerLog = exports.getWorkerLogById = exports.getAllWorkerLogs = exports.createWorkerLog = exports.WorkerActivityType = exports.DepartmentStage = void 0;
// src/services/workerLogService.ts
const db_1 = __importDefault(require("../config/db"));
var DepartmentStage;
(function (DepartmentStage) {
    DepartmentStage["NEW_ARRIVAL"] = "NEW_ARRIVAL";
    DepartmentStage["IN_PROGRESS"] = "IN_PROGRESS";
    DepartmentStage["COMPLETED"] = "COMPLETED";
})(DepartmentStage || (exports.DepartmentStage = DepartmentStage = {}));
var WorkerActivityType;
(function (WorkerActivityType) {
    WorkerActivityType["NORMAL"] = "NORMAL";
    WorkerActivityType["REJECTED"] = "REJECTED";
    WorkerActivityType["ALTERED"] = "ALTERED";
})(WorkerActivityType || (exports.WorkerActivityType = WorkerActivityType = {}));
/// ✅ Create Worker Log with optional rejected/altered
const createWorkerLog = async (data) => {
    return await db_1.default.$transaction(async (tx) => {
        // 1️⃣ Find the active department_sub_batch entry for this sub-batch and department
        let departmentSubBatchId = null;
        let newDeptSubBatchId = null;
        if (data.department_id && data.quantity_worked && data.quantity_worked > 0) {
            // Find unassigned entries (quantity_assigned is null or 0) with available quantity
            const activeDeptSubBatch = await tx.department_sub_batches.findFirst({
                where: {
                    sub_batch_id: data.sub_batch_id,
                    department_id: data.department_id,
                    is_current: true, // Only get active entries
                    OR: [
                        { quantity_assigned: null },
                        { quantity_assigned: 0 },
                    ],
                    quantity_remaining: {
                        gte: data.quantity_worked, // Must have enough pieces
                    },
                },
                orderBy: {
                    createdAt: 'desc', // Get the most recent one if multiple exist
                },
            });
            if (!activeDeptSubBatch) {
                throw new Error(`No unassigned department_sub_batch entry found with sufficient quantity (${data.quantity_worked} pieces needed)`);
            }
            // 2️⃣ Split the sub-batch: Create a new entry for the assigned pieces
            const newDeptSubBatch = await tx.department_sub_batches.create({
                data: {
                    sub_batch_id: data.sub_batch_id,
                    department_id: data.department_id,
                    assigned_worker_id: data.worker_id,
                    stage: activeDeptSubBatch.stage,
                    is_current: true,
                    quantity_assigned: data.quantity_worked, // ✅ Store assigned quantity
                    quantity_remaining: data.quantity_worked, // Initially same as assigned
                    quantity_received: data.quantity_worked,
                    total_quantity: activeDeptSubBatch.total_quantity,
                    sent_from_department: activeDeptSubBatch.sent_from_department,
                },
            });
            newDeptSubBatchId = newDeptSubBatch.id;
            // 3️⃣ Reduce quantity from the original entry
            await tx.department_sub_batches.update({
                where: { id: activeDeptSubBatch.id },
                data: {
                    quantity_remaining: { decrement: data.quantity_worked },
                },
            });
            departmentSubBatchId = newDeptSubBatchId;
        }
        // 4️⃣ Create main worker log with department_sub_batch_id
        const log = await tx.worker_logs.create({
            data: {
                worker_id: data.worker_id,
                sub_batch_id: data.sub_batch_id,
                department_id: data.department_id,
                department_sub_batch_id: departmentSubBatchId, // ✅ Link to the new split sub-batch
                worker_name: data.worker_name,
                work_date: data.work_date ? new Date(data.work_date) : undefined,
                size_category: data.size_category,
                particulars: data.particulars,
                quantity_received: data.quantity_received,
                quantity_worked: data.quantity_worked,
                unit_price: data.unit_price,
                activity_type: data.activity_type ?? "NORMAL",
                is_billable: data.is_billable ?? true,
            },
        });
        const logId = log.id;
        // 5️⃣ Handle rejected entries (if any)
        if (data.rejected && data.rejected.length > 0) {
            for (const r of data.rejected) {
                // Verify source entry exists and has sufficient quantity
                const sourceEntry = await tx.department_sub_batches.findUnique({
                    where: { id: r.source_department_sub_batch_id },
                });
                if (!sourceEntry) {
                    throw new Error(`Source department_sub_batch entry ${r.source_department_sub_batch_id} not found`);
                }
                if (!sourceEntry.is_current) {
                    throw new Error(`Source entry ${r.source_department_sub_batch_id} is not active`);
                }
                if ((sourceEntry.quantity_remaining || 0) < r.quantity) {
                    throw new Error(`Insufficient quantity in source entry. Available: ${sourceEntry.quantity_remaining}, requested: ${r.quantity}`);
                }
                // Reduce quantity from SPECIFIC entry (not all entries)
                await tx.department_sub_batches.update({
                    where: {
                        id: r.source_department_sub_batch_id,
                    },
                    data: {
                        quantity_remaining: { decrement: r.quantity },
                    },
                });
                // Create new department_sub_batches for rejected pieces
                const newDept = await tx.department_sub_batches.create({
                    data: {
                        sub_batch_id: data.sub_batch_id,
                        department_id: r.sent_to_department_id,
                        stage: DepartmentStage.NEW_ARRIVAL,
                        is_current: true,
                        quantity_remaining: r.quantity,
                        total_quantity: sourceEntry.total_quantity, // Copy the original total quantity
                        remarks: "Rejected",
                        reject_reason: r.reason, // ✅ Store reject reason
                        sent_from_department: sourceEntry.department_id, // ✅ Track which department it came from
                    },
                });
                // Create rejected record with BOTH source and created IDs
                const rejectedRecord = await tx.sub_batch_rejected.create({
                    data: {
                        sub_batch_id: data.sub_batch_id,
                        quantity: r.quantity,
                        sent_to_department_id: r.sent_to_department_id,
                        reason: r.reason,
                        worker_log_id: logId,
                        source_department_sub_batch_id: r.source_department_sub_batch_id, // ✅ Store source entry
                        created_department_sub_batch_id: newDept.id, // ✅ Store created entry
                    },
                });
                // Log history
                await tx.department_sub_batch_history.create({
                    data: {
                        department_sub_batch_id: newDept.id,
                        sub_batch_id: data.sub_batch_id,
                        to_stage: DepartmentStage.NEW_ARRIVAL,
                        to_department_id: r.sent_to_department_id,
                        reason: r.reason,
                    },
                });
            }
        }
        // 6️⃣ Handle altered entries (if any)
        if (data.altered && data.altered.length > 0) {
            for (const a of data.altered) {
                // Verify source entry exists and has sufficient quantity
                const sourceEntry = await tx.department_sub_batches.findUnique({
                    where: { id: a.source_department_sub_batch_id },
                });
                if (!sourceEntry) {
                    throw new Error(`Source department_sub_batch entry ${a.source_department_sub_batch_id} not found`);
                }
                if (!sourceEntry.is_current) {
                    throw new Error(`Source entry ${a.source_department_sub_batch_id} is not active`);
                }
                if ((sourceEntry.quantity_remaining || 0) < a.quantity) {
                    throw new Error(`Insufficient quantity in source entry. Available: ${sourceEntry.quantity_remaining}, requested: ${a.quantity}`);
                }
                // Reduce quantity from SPECIFIC entry (not all entries)
                await tx.department_sub_batches.update({
                    where: {
                        id: a.source_department_sub_batch_id,
                    },
                    data: {
                        quantity_remaining: { decrement: a.quantity },
                    },
                });
                // Create department_sub_batches for altered pieces
                const newDept = await tx.department_sub_batches.create({
                    data: {
                        sub_batch_id: data.sub_batch_id,
                        department_id: a.sent_to_department_id,
                        stage: DepartmentStage.NEW_ARRIVAL,
                        is_current: true,
                        quantity_remaining: a.quantity,
                        total_quantity: sourceEntry.total_quantity, // Copy the original total quantity
                        remarks: "Altered",
                        alter_reason: a.reason, // ✅ Store alter reason
                        sent_from_department: sourceEntry.department_id, // ✅ Track which department it came from
                    },
                });
                // Create altered record with BOTH source and created IDs
                const alteredRecord = await tx.sub_batch_altered.create({
                    data: {
                        sub_batch_id: data.sub_batch_id,
                        quantity: a.quantity,
                        sent_to_department_id: a.sent_to_department_id,
                        reason: a.reason,
                        worker_log_id: logId,
                        source_department_sub_batch_id: a.source_department_sub_batch_id, // ✅ Store source entry
                        created_department_sub_batch_id: newDept.id, // ✅ Store created entry
                    },
                });
                // Log history
                await tx.department_sub_batch_history.create({
                    data: {
                        department_sub_batch_id: newDept.id,
                        sub_batch_id: data.sub_batch_id,
                        to_stage: DepartmentStage.NEW_ARRIVAL,
                        to_department_id: a.sent_to_department_id,
                        reason: a.reason,
                    },
                });
            }
        }
        // 7️⃣ Fetch and return the full worker log including rejected/altered
        return await tx.worker_logs.findUnique({
            where: { id: logId },
            include: {
                worker: true,
                sub_batch: true,
                departments: true,
                department_sub_batch: true, // ✅ Include department sub-batch relation
                rejected_entry: true,
                altered_entry: true,
            },
        });
    });
};
exports.createWorkerLog = createWorkerLog;
/// ✅ Get All Worker Logs (with rejected & altered)
const getAllWorkerLogs = async () => {
    return await db_1.default.worker_logs.findMany({
        include: {
            worker: true,
            sub_batch: true,
            departments: true,
            department_sub_batch: true, // ✅ Include department sub-batch relation
            rejected_entry: true,
            altered_entry: true,
        },
    });
};
exports.getAllWorkerLogs = getAllWorkerLogs;
/// ✅ Get Worker Log by ID
const getWorkerLogById = async (id) => {
    return await db_1.default.worker_logs.findUnique({
        where: { id },
        include: {
            worker: true,
            sub_batch: true,
            departments: true,
            department_sub_batch: true, // ✅ Include department sub-batch relation
            rejected_entry: true,
            altered_entry: true,
        },
    });
};
exports.getWorkerLogById = getWorkerLogById;
/// ✅ Update Worker Log (with optional rejected/altered updates)
const updateWorkerLog = async (id, data) => {
    // Find the active department_sub_batch entry if department_id is being updated
    let departmentSubBatchId = undefined;
    if (data.department_id !== undefined) {
        const activeDeptSubBatch = await db_1.default.department_sub_batches.findFirst({
            where: {
                sub_batch_id: data.sub_batch_id,
                department_id: data.department_id,
                is_current: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        departmentSubBatchId = activeDeptSubBatch?.id ?? null;
    }
    return await db_1.default.worker_logs.update({
        where: { id },
        data: {
            worker_id: data.worker_id,
            sub_batch_id: data.sub_batch_id,
            department_id: data.department_id,
            department_sub_batch_id: departmentSubBatchId, // ✅ Update department sub-batch link
            worker_name: data.worker_name,
            work_date: data.work_date ? new Date(data.work_date) : undefined,
            size_category: data.size_category,
            particulars: data.particulars,
            quantity_received: data.quantity_received,
            quantity_worked: data.quantity_worked,
            unit_price: data.unit_price,
            activity_type: data.activity_type,
            is_billable: data.is_billable,
        },
        include: {
            worker: true,
            sub_batch: true,
            departments: true,
            department_sub_batch: true, // ✅ Include department sub-batch relation
            rejected_entry: true,
            altered_entry: true,
        },
    });
};
exports.updateWorkerLog = updateWorkerLog;
/// ✅ Delete Worker Log (and reverse all reject/alter operations)
const deleteWorkerLog = async (id) => {
    return await db_1.default.$transaction(async (tx) => {
        // 1️⃣ First, fetch the worker log with all related data
        const workerLog = await tx.worker_logs.findUnique({
            where: { id },
            include: {
                rejected_entry: true,
                altered_entry: true,
                department_sub_batch: true,
            },
        });
        if (!workerLog) {
            throw new Error(`Worker log ${id} not found`);
        }
        console.log(`=== Deleting Worker Log ${id} ===`);
        console.log(`Rejected entries: ${workerLog.rejected_entry?.length || 0}`);
        console.log(`Altered entries: ${workerLog.altered_entry?.length || 0}`);
        console.log(`Department sub-batch ID: ${workerLog.department_sub_batch_id}`);
        // 1.5️⃣ Handle the split sub-batch (if this log created a new department_sub_batch for assigned work)
        if (workerLog.department_sub_batch_id && workerLog.department_sub_batch) {
            const deptSubBatch = workerLog.department_sub_batch;
            // Check if this is a split sub-batch (has quantity_assigned)
            if (deptSubBatch.quantity_assigned && deptSubBatch.quantity_assigned > 0) {
                console.log(`\n--- Reversing Split Sub-Batch ${deptSubBatch.id} ---`);
                console.log(`Assigned quantity: ${deptSubBatch.quantity_assigned}`);
                // Find the parent/sibling entry to restore quantity to
                // Look for an unassigned entry in the same department and sub-batch
                const parentEntry = await tx.department_sub_batches.findFirst({
                    where: {
                        sub_batch_id: deptSubBatch.sub_batch_id,
                        department_id: deptSubBatch.department_id,
                        is_current: true,
                        id: { not: deptSubBatch.id }, // Not the same entry
                        OR: [
                            { quantity_assigned: null },
                            { quantity_assigned: 0 },
                        ],
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                if (parentEntry) {
                    // Restore the quantity to the parent entry
                    await tx.department_sub_batches.update({
                        where: { id: parentEntry.id },
                        data: {
                            quantity_remaining: { increment: deptSubBatch.quantity_assigned },
                        },
                    });
                    console.log(`✓ Restored ${deptSubBatch.quantity_assigned} pieces to parent entry ${parentEntry.id}`);
                }
                else {
                    console.warn(`⚠ No parent entry found for split sub-batch ${deptSubBatch.id}. Creating a new unassigned entry.`);
                    // If no parent found, create a new unassigned entry with the quantity
                    await tx.department_sub_batches.create({
                        data: {
                            sub_batch_id: deptSubBatch.sub_batch_id,
                            department_id: deptSubBatch.department_id,
                            stage: deptSubBatch.stage,
                            is_current: true,
                            quantity_remaining: deptSubBatch.quantity_assigned,
                            quantity_received: deptSubBatch.quantity_assigned,
                            total_quantity: deptSubBatch.total_quantity,
                            sent_from_department: deptSubBatch.sent_from_department,
                        },
                    });
                    console.log(`✓ Created new unassigned entry with ${deptSubBatch.quantity_assigned} pieces`);
                }
                // Delete the split sub-batch entry
                await tx.department_sub_batches.delete({
                    where: { id: deptSubBatch.id },
                });
                console.log(`✓ Deleted split sub-batch entry ${deptSubBatch.id}`);
            }
        }
        // 2️⃣ Reverse rejected entries
        if (workerLog.rejected_entry && workerLog.rejected_entry.length > 0) {
            for (const rejectedRecord of workerLog.rejected_entry) {
                console.log(`\n--- Processing Rejected Entry ${rejectedRecord.id} ---`);
                console.log(`Quantity: ${rejectedRecord.quantity}`);
                console.log(`Source entry ID: ${rejectedRecord.source_department_sub_batch_id}`);
                console.log(`Created entry ID: ${rejectedRecord.created_department_sub_batch_id}`);
                // ✅ DELETE the created entry completely (don't just mark inactive)
                if (rejectedRecord.created_department_sub_batch_id) {
                    const createdEntry = await tx.department_sub_batches.findUnique({
                        where: { id: rejectedRecord.created_department_sub_batch_id },
                    });
                    if (createdEntry) {
                        // DELETE the created rejected entry completely
                        await tx.department_sub_batches.delete({
                            where: { id: rejectedRecord.created_department_sub_batch_id },
                        });
                        console.log(`✓ Deleted rejected department entry ${rejectedRecord.created_department_sub_batch_id} completely`);
                    }
                    else {
                        console.warn(`⚠ Created entry ${rejectedRecord.created_department_sub_batch_id} not found (already deleted?)`);
                    }
                }
                // ✅ Use the EXACT source entry ID that was stored
                if (rejectedRecord.source_department_sub_batch_id) {
                    const sourceEntry = await tx.department_sub_batches.findUnique({
                        where: { id: rejectedRecord.source_department_sub_batch_id },
                    });
                    if (sourceEntry) {
                        // Restore quantity to the EXACT source entry
                        await tx.department_sub_batches.update({
                            where: { id: rejectedRecord.source_department_sub_batch_id },
                            data: {
                                quantity_remaining: { increment: rejectedRecord.quantity },
                            },
                        });
                        console.log(`✓ Restored ${rejectedRecord.quantity} to source entry ${rejectedRecord.source_department_sub_batch_id}`);
                    }
                    else {
                        console.error(`❌ Source entry ${rejectedRecord.source_department_sub_batch_id} not found! Cannot restore quantity.`);
                    }
                }
                else {
                    console.error(`❌ No source_department_sub_batch_id stored! Cannot restore quantity precisely.`);
                }
                // Delete the sub_batch_rejected record
                await tx.sub_batch_rejected.delete({
                    where: { id: rejectedRecord.id },
                });
                console.log(`✓ Deleted rejected record ${rejectedRecord.id}`);
            }
        }
        // 3️⃣ Reverse altered entries
        if (workerLog.altered_entry && workerLog.altered_entry.length > 0) {
            for (const alteredRecord of workerLog.altered_entry) {
                console.log(`\n--- Processing Altered Entry ${alteredRecord.id} ---`);
                console.log(`Quantity: ${alteredRecord.quantity}`);
                console.log(`Source entry ID: ${alteredRecord.source_department_sub_batch_id}`);
                console.log(`Created entry ID: ${alteredRecord.created_department_sub_batch_id}`);
                // ✅ DELETE the created entry completely (don't just mark inactive)
                if (alteredRecord.created_department_sub_batch_id) {
                    const createdEntry = await tx.department_sub_batches.findUnique({
                        where: { id: alteredRecord.created_department_sub_batch_id },
                    });
                    if (createdEntry) {
                        // DELETE the created altered entry completely
                        await tx.department_sub_batches.delete({
                            where: { id: alteredRecord.created_department_sub_batch_id },
                        });
                        console.log(`✓ Deleted altered department entry ${alteredRecord.created_department_sub_batch_id} completely`);
                    }
                    else {
                        console.warn(`⚠ Created entry ${alteredRecord.created_department_sub_batch_id} not found (already deleted?)`);
                    }
                }
                // ✅ Use the EXACT source entry ID that was stored
                if (alteredRecord.source_department_sub_batch_id) {
                    const sourceEntry = await tx.department_sub_batches.findUnique({
                        where: { id: alteredRecord.source_department_sub_batch_id },
                    });
                    if (sourceEntry) {
                        // Restore quantity to the EXACT source entry
                        await tx.department_sub_batches.update({
                            where: { id: alteredRecord.source_department_sub_batch_id },
                            data: {
                                quantity_remaining: { increment: alteredRecord.quantity },
                            },
                        });
                        console.log(`✓ Restored ${alteredRecord.quantity} to source entry ${alteredRecord.source_department_sub_batch_id}`);
                    }
                    else {
                        console.error(`❌ Source entry ${alteredRecord.source_department_sub_batch_id} not found! Cannot restore quantity.`);
                    }
                }
                else {
                    console.error(`❌ No source_department_sub_batch_id stored! Cannot restore quantity precisely.`);
                }
                // Delete the sub_batch_altered record
                await tx.sub_batch_altered.delete({
                    where: { id: alteredRecord.id },
                });
                console.log(`✓ Deleted altered record ${alteredRecord.id}`);
            }
        }
        // 4️⃣ Finally, delete the worker log
        console.log(`\n✓ Deleting worker log ${id}`);
        return await tx.worker_logs.delete({
            where: { id },
            include: {
                rejected_entry: true,
                altered_entry: true,
            },
        });
    });
};
exports.deleteWorkerLog = deleteWorkerLog;
/// ✅ Get Worker Logs by Sub-Batch (with rejected/altered)
const getWorkerLogsBySubBatch = async (sub_batch_id) => {
    return await db_1.default.worker_logs.findMany({
        where: { sub_batch_id },
        include: {
            worker: true,
            sub_batch: true,
            departments: true,
            department_sub_batch: true, // ✅ Include department sub-batch relation
            rejected_entry: true,
            altered_entry: true,
        },
        orderBy: { work_date: "asc" },
    });
};
exports.getWorkerLogsBySubBatch = getWorkerLogsBySubBatch;
