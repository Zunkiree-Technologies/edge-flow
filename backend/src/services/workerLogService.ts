// src/services/workerLogService.ts
import prisma, { Prisma } from "../config/db";

export enum DepartmentStage {
  NEW_ARRIVAL = "NEW_ARRIVAL",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum WorkerActivityType {
  NORMAL = "NORMAL",
  REJECTED = "REJECTED",
  ALTERED = "ALTERED",
}

interface RejectedInput {
  quantity: number;
  sent_to_department_id: number;
  original_department_id: number;
  reason: string;
}

interface AlteredInput {
  quantity: number;
  sent_to_department_id: number;
  reason: string;
}

export interface WorkerLogInput {
  worker_id: number;
  sub_batch_id: number;
  worker_name?: string;
  work_date?: string;
  size_category?: string;
  particulars?: string;
  quantity_received?: number;
  quantity_worked?: number;
  unit_price?: number;
  activity_type?: WorkerActivityType;
  rejected?: RejectedInput[];
  altered?: AlteredInput[];
}

/// ✅ Create Worker Log with optional rejected/altered
export const createWorkerLog = async (data: WorkerLogInput) => {
  // 1️⃣ Create main worker log first (separate transaction)
  const log = await prisma.worker_logs.create({
    data: {
      worker_id: data.worker_id,
      sub_batch_id: data.sub_batch_id,
      worker_name: data.worker_name,
      work_date: data.work_date ? new Date(data.work_date) : undefined,
      size_category: data.size_category,
      particulars: data.particulars,
      quantity_received: data.quantity_received,
      quantity_worked: data.quantity_worked,
      unit_price: data.unit_price,
      activity_type: data.activity_type ?? "NORMAL",
    },
  });

  const logId = log.id;

  // 2️⃣ Handle rejected entries (if any)
  if (data.rejected && data.rejected.length > 0) {
    for (const r of data.rejected) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const rejectedRecord = await tx.sub_batch_rejected.create({
          data: {
            sub_batch_id: data.sub_batch_id,
            quantity: r.quantity,
            sent_to_department_id: r.sent_to_department_id,
            reason: r.reason,
            worker_log_id: logId,
          },
        });

        // Reduce quantity from original department
        await tx.department_sub_batches.updateMany({
          where: {
            sub_batch_id: data.sub_batch_id,
            department_id: r.original_department_id,
            is_current: true,
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
            remarks: "Rejected",
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
      });
    }
  }

  // 3️⃣ Handle altered entries (if any)
  if (data.altered && data.altered.length > 0) {
    for (const a of data.altered) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const alteredRecord = await tx.sub_batch_altered.create({
          data: {
            sub_batch_id: data.sub_batch_id,
            quantity: a.quantity,
            sent_to_department_id: a.sent_to_department_id,
            reason: a.reason,
            worker_log_id: logId,
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
            remarks: "Altered",
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
      });
    }
  }

  // 4️⃣ Fetch and return the full worker log including rejected/altered
  return await prisma.worker_logs.findUnique({
    where: { id: logId },
    include: {
      worker: true,
      sub_batch: true,
      rejected_entry: true,
      altered_entry: true,
    },
  });
};

/// ✅ Get All Worker Logs (with rejected & altered)
export const getAllWorkerLogs = async () => {
  return await prisma.worker_logs.findMany(
    {
      include: {
        worker: true,
        sub_batch: true,
        rejected_entry: true,
        altered_entry: true,
      },
    });
};

/// ✅ Get Worker Log by ID
export const getWorkerLogById = async (id: number) => {
  return await prisma.worker_logs.findUnique({
    where: { id },
    include: {
      worker: true,
      sub_batch: true,
      rejected_entry: true,
      altered_entry: true,
    },
  });
};

/// ✅ Update Worker Log (with optional rejected/altered updates)
export const updateWorkerLog = async (id: number, data: WorkerLogInput) => {
  return await prisma.worker_logs.update({
    where: { id },
    data: {
      worker_id: data.worker_id,
      sub_batch_id: data.sub_batch_id,
      worker_name: data.worker_name,
      work_date: data.work_date ? new Date(data.work_date) : undefined,
      size_category: data.size_category,
      particulars: data.particulars,
      quantity_received: data.quantity_received,
      quantity_worked: data.quantity_worked,
      unit_price: data.unit_price,
      activity_type: data.activity_type,
    },
    include: {
      worker: true,
      sub_batch: true,
      rejected_entry: true,
      altered_entry: true,
    },
  });
};

/// ✅ Delete Worker Log (cascade delete rejected/altered)
export const deleteWorkerLog = async (id: number) => {
  return await prisma.worker_logs.delete({
    where: { id },
    include: {
      rejected_entry: true,
      altered_entry: true,
    },
  });
};

/// ✅ Get Worker Logs by Sub-Batch (with rejected/altered)
export const getWorkerLogsBySubBatch = async (sub_batch_id: number) => {
  return await prisma.worker_logs.findMany({
    where: { sub_batch_id },
    include: {
      worker: true,
      sub_batch: true,
      rejected_entry: true,
      altered_entry: true,
    },
    orderBy: { work_date: "asc" },
  });
};
