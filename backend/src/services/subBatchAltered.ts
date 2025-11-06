// src/services/subBatchAltered.ts
import prisma, { Prisma } from "../config/db";

export enum DepartmentStage {
  NEW_ARRIVAL = "NEW_ARRIVAL",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// Input type for altered pieces
interface AlteredPieceInput {
  sub_batch_id: number;
  quantity: number;
  target_department_id: number;
  original_department_id: number; // department from which quantity is reduced
  reason: string;
  worker_log_id?: number; // optional link to worker log
}

export const createAlteredSubBatch = async (data: AlteredPieceInput) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1️⃣ Create altered record
    const altered = await tx.sub_batch_altered.create({
      data: {
        sub_batch_id: data.sub_batch_id,
        quantity: data.quantity,
        sent_to_department_id: data.target_department_id,
        reason: data.reason,
        worker_log_id: data.worker_log_id ?? null,
      },
    });

    // 2️⃣ Get original sub-batch to know estimated pieces
    const subBatch = await tx.sub_batches.findUnique({
      where: { id: data.sub_batch_id },
    });
    if (!subBatch) throw new Error("Sub-batch not found");

    // 2.5️⃣ Reduce quantity_remaining from original department
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

    // 3️⃣ Add to department_sub_batches for target department
    const deptSubBatch = await tx.department_sub_batches.create({
      data: {
        sub_batch_id: data.sub_batch_id,
        department_id: data.target_department_id,
        stage: DepartmentStage.NEW_ARRIVAL,
        is_current: true,
        quantity_remaining: data.quantity, // only altered quantity
        remarks: "Altered",
      },
    });

    // 4️⃣ Log history
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

// ✅ Fetch all altered sub-batches with related data
export const getAllAlteredSubBatches = async () => {
  return await prisma.sub_batch_altered.findMany({
    include: {
      sub_batch: true,
      sent_to_department: true,
      worker_log: true, // fetch linked worker log if available
    },
  });
};

// ✅ Fetch altered sub-batches by Sub-Batch ID
export const getAlteredBySubBatch = async (sub_batch_id: number) => {
  return await prisma.sub_batch_altered.findMany({
    where: { sub_batch_id },
    include: {
      sub_batch: true,
      sent_to_department: true,
      worker_log: true,
    },
  });
};
