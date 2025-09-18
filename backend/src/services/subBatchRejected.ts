// src/services/subBatchRejected.ts
import prisma, { Prisma } from "../config/db";

export enum DepartmentStage {
  NEW_ARRIVAL = "NEW_ARRIVAL",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// Input type for rejected pieces
interface RejectedData {
  sub_batch_id: number;
  quantity: number;
  reason: string;
  sent_to_department_id: number; // where rejected pieces go
  original_department_id: number; // department from which quantity is reduced
  worker_log_id?: number; // optional link to worker log
}

export const createRejectedSubBatch = async (data: RejectedData) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1️⃣ Add record to sub_batch_rejected
    const rejected = await tx.sub_batch_rejected.create({
      data: {
        sub_batch_id: data.sub_batch_id,
        quantity: data.quantity,
        reason: data.reason,
        sent_to_department_id: data.sent_to_department_id,
        worker_log_id: data.worker_log_id ?? null,
      },
    });

    // 2️⃣ Reduce quantity_remaining from original department
    await tx.department_sub_batches.updateMany({
      where: {
        sub_batch_id: data.sub_batch_id,
        department_id: data.original_department_id,
        is_current: true,
      },
      data: {
        quantity_remaining: { decrement: data.quantity },
      },
    });

    // 3️⃣ Create new department_sub_batches record for rejected pieces
    const newDeptSubBatch = await tx.department_sub_batches.create({
      data: {
        sub_batch_id: data.sub_batch_id,
        department_id: data.sent_to_department_id,
        stage: DepartmentStage.NEW_ARRIVAL,
        is_current: true,
        quantity_remaining: data.quantity,
        remarks: "Rejected",
      },
    });

    // 4️⃣ Log history
    await tx.department_sub_batch_history.create({
      data: {
        department_sub_batch_id: newDeptSubBatch.id,
        sub_batch_id: data.sub_batch_id,
        from_stage: null,
        to_stage: DepartmentStage.NEW_ARRIVAL,
        to_department_id: data.sent_to_department_id,
        reason: data.reason,
      },
    });

    return rejected;
  });
};

// ✅ Fetch all rejected sub-batches with related data
export const getAllRejectedSubBatches = async () => {
  return await prisma.sub_batch_rejected.findMany({
    include: {
      sub_batch: true,
      sent_to_department: true,
      worker_log: true, // fetch linked worker log if available
    },
  });
};

// ✅ Fetch rejected sub-batches by Sub-Batch ID
export const getRejectedBySubBatch = async (sub_batch_id: number) => {
  return await prisma.sub_batch_rejected.findMany({
    where: { sub_batch_id },
    include: {
      sub_batch: true,
      sent_to_department: true,
      worker_log: true,
    },
  });
};
