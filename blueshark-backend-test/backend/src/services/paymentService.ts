// src/services/paymentService.ts
// Note: After adding wage_payments to schema, run:
//   npx prisma migrate dev --name add_payment_tracking
//   npx prisma generate
import prisma, { Prisma } from "../config/db";

// Temporary type alias until Prisma types are regenerated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WagePaymentsWhereInput = any;

// Type definitions matching Prisma enums
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHECK" | "MOBILE_WALLET";
export type PaymentType = "DATE_RANGE" | "SUB_BATCH" | "DIRECT";

export interface RecordPaymentInput {
  worker_id: number;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  payment_date?: Date;
  reference_number?: string;
  remarks?: string;
  // For DATE_RANGE type
  start_date?: Date;
  end_date?: Date;
  // For SUB_BATCH type
  sub_batch_id?: number;
  // User who recorded the payment
  recorded_by?: number;
}

export interface PaymentFilters {
  worker_id?: number;
  payment_type?: PaymentType;
  payment_method?: PaymentMethod;
  start_date?: Date;
  end_date?: Date;
}

export interface PaymentSummary {
  total_paid: number;
  total_payments: number;
  by_method: Record<string, number>;
  by_type: Record<string, number>;
}

export interface UnpaidWagesSummary {
  worker_id: number;
  worker_name: string;
  total_earned: number;
  total_paid: number;
  unpaid_amount: number;
}

// Payment record type for internal use
interface PaymentRecord {
  id: number;
  worker_id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_date: Date;
  reference_number: string | null;
  remarks: string | null;
  start_date: Date | null;
  end_date: Date | null;
  sub_batch_id: number | null;
  recorded_by: number | null;
  created_at: Date;
}

/**
 * Record a new payment to a worker
 */
export const recordPayment = async (data: RecordPaymentInput) => {
  // Validate required fields
  if (!data.worker_id || data.amount === undefined || !data.payment_type || !data.payment_method) {
    throw new Error("Missing required fields: worker_id, amount, payment_type, payment_method");
  }

  // Validate payment type specific fields
  if (data.payment_type === "DATE_RANGE") {
    if (!data.start_date || !data.end_date) {
      throw new Error("DATE_RANGE payment requires start_date and end_date");
    }
  }

  if (data.payment_type === "SUB_BATCH") {
    if (!data.sub_batch_id) {
      throw new Error("SUB_BATCH payment requires sub_batch_id");
    }
  }

  // Verify worker exists
  const worker = await prisma.workers.findUnique({
    where: { id: data.worker_id },
  });

  if (!worker) {
    throw new Error(`Worker with ID ${data.worker_id} not found`);
  }

  // Verify sub_batch exists if provided
  if (data.sub_batch_id) {
    const subBatch = await prisma.sub_batches.findUnique({
      where: { id: data.sub_batch_id },
    });
    if (!subBatch) {
      throw new Error(`Sub-batch with ID ${data.sub_batch_id} not found`);
    }
  }

  // Validate payment doesn't exceed remaining balance (prevent overpayment)
  // Calculate total already paid to this worker (exclude voided payments)
  const existingPayments = await prisma.wage_payments.aggregate({
    where: { worker_id: data.worker_id, is_voided: false } as WagePaymentsWhereInput,
    _sum: { amount: true },
  });
  const totalPaid = existingPayments._sum?.amount || 0;

  // Calculate total billable wages from worker_logs
  const billableLogs = await prisma.worker_logs.findMany({
    where: { worker_id: data.worker_id, is_billable: true },
  });
  const totalBillable = billableLogs.reduce(
    (sum, log) => sum + (log.quantity_worked || 0) * (log.unit_price || 0),
    0
  );

  // Check if payment would exceed billable wages
  const remainingBalance = totalBillable - totalPaid;
  if (data.amount > remainingBalance) {
    if (remainingBalance <= 0) {
      throw new Error(
        `Payment rejected: Worker has no remaining balance. All billable wages (Rs. ${totalBillable.toFixed(2)}) have been paid.`
      );
    }
    throw new Error(
      `Payment amount (Rs. ${data.amount.toFixed(2)}) exceeds remaining balance (Rs. ${remainingBalance.toFixed(2)})`
    );
  }

  // Create payment record
  const payment = await prisma.wage_payments.create({
    data: {
      worker_id: data.worker_id,
      amount: data.amount,
      payment_type: data.payment_type,
      payment_method: data.payment_method,
      payment_date: data.payment_date || new Date(),
      reference_number: data.reference_number,
      remarks: data.remarks,
      start_date: data.start_date,
      end_date: data.end_date,
      sub_batch_id: data.sub_batch_id,
      recorded_by: data.recorded_by,
    },
    include: {
      worker: {
        select: {
          id: true,
          name: true,
        },
      },
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Get all payments with optional filters
 */
export const getPayments = async (filters: PaymentFilters = {}) => {
  const whereClause: WagePaymentsWhereInput = {};

  if (filters.worker_id) {
    whereClause.worker_id = filters.worker_id;
  }

  if (filters.payment_type) {
    whereClause.payment_type = filters.payment_type;
  }

  if (filters.payment_method) {
    whereClause.payment_method = filters.payment_method;
  }

  if (filters.start_date || filters.end_date) {
    whereClause.payment_date = {};
    if (filters.start_date) {
      whereClause.payment_date.gte = filters.start_date;
    }
    if (filters.end_date) {
      whereClause.payment_date.lte = filters.end_date;
    }
  }

  const payments = await prisma.wage_payments.findMany({
    where: whereClause,
    include: {
      worker: {
        select: {
          id: true,
          name: true,
        },
      },
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      payment_date: "desc",
    },
  });

  return payments;
};

/**
 * Get a single payment by ID
 */
export const getPaymentById = async (paymentId: number) => {
  const payment = await prisma.wage_payments.findUnique({
    where: { id: paymentId },
    include: {
      worker: {
        select: {
          id: true,
          name: true,
        },
      },
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error(`Payment with ID ${paymentId} not found`);
  }

  return payment;
};

/**
 * Get all payments for a specific worker
 * Returns all payments (including voided) but only counts non-voided in summary
 */
export const getPaymentsByWorker = async (workerId: number) => {
  const payments = await prisma.wage_payments.findMany({
    where: { worker_id: workerId },
    include: {
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      payment_date: "desc",
    },
  });

  // Calculate summary - EXCLUDE voided payments from totals
  let totalPaid = 0;
  let activePayments = 0;
  const byMethod: Record<string, number> = {};
  const byType: Record<string, number> = {};

  payments.forEach((p: PaymentRecord & { is_voided?: boolean }) => {
    // Skip voided payments in calculations
    if (p.is_voided) return;

    totalPaid += p.amount;
    activePayments++;
    byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + p.amount;
    byType[p.payment_type] = (byType[p.payment_type] || 0) + p.amount;
  });

  return {
    payments, // Return ALL payments (including voided) for display
    summary: {
      total_paid: totalPaid, // Only non-voided payments counted
      total_payments: activePayments, // Only non-voided payments counted
      by_method: byMethod,
      by_type: byType,
    },
  };
};

/**
 * Get payment summary for dashboard
 * Excludes voided payments from calculations
 */
export const getPaymentSummary = async (
  departmentId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<PaymentSummary> => {
  const whereClause: WagePaymentsWhereInput = {
    is_voided: false, // Exclude voided payments
  };

  if (startDate || endDate) {
    whereClause.payment_date = {};
    if (startDate) whereClause.payment_date.gte = startDate;
    if (endDate) whereClause.payment_date.lte = endDate;
  }

  // If department filter, need to join with workers
  if (departmentId) {
    whereClause.worker = {
      department_id: departmentId,
    };
  }

  const payments = await prisma.wage_payments.findMany({
    where: whereClause,
  });

  let totalPaid = 0;
  const byMethod: Record<string, number> = {};
  const byType: Record<string, number> = {};

  payments.forEach((p: PaymentRecord) => {
    totalPaid += p.amount;
    byMethod[p.payment_method] = (byMethod[p.payment_method] || 0) + p.amount;
    byType[p.payment_type] = (byType[p.payment_type] || 0) + p.amount;
  });

  return {
    total_paid: totalPaid,
    total_payments: payments.length,
    by_method: byMethod,
    by_type: byType,
  };
};

/**
 * Calculate unpaid wages for a worker
 * Compares total earned (from worker_logs) vs total paid (from wage_payments)
 */
export const getUnpaidWages = async (
  workerId: number,
  startDate?: Date,
  endDate?: Date
): Promise<UnpaidWagesSummary> => {
  // Get worker info
  const worker = await prisma.workers.findUnique({
    where: { id: workerId },
    select: { id: true, name: true },
  });

  if (!worker) {
    throw new Error(`Worker with ID ${workerId} not found`);
  }

  // Calculate total earned from billable worker_logs
  const logsWhereClause: Prisma.worker_logsWhereInput = {
    worker_id: workerId,
    is_billable: true,
  };

  if (startDate || endDate) {
    logsWhereClause.work_date = {};
    if (startDate) logsWhereClause.work_date.gte = startDate;
    if (endDate) logsWhereClause.work_date.lte = endDate;
  }

  const logs = await prisma.worker_logs.findMany({
    where: logsWhereClause,
  });

  const totalEarned = logs.reduce((sum, log) => {
    return sum + (log.quantity_worked || 0) * (log.unit_price || 0);
  }, 0);

  // Calculate total paid
  const paymentsWhereClause: Prisma.wage_paymentsWhereInput = {
    worker_id: workerId,
  };

  if (startDate || endDate) {
    paymentsWhereClause.payment_date = {};
    if (startDate) paymentsWhereClause.payment_date.gte = startDate;
    if (endDate) paymentsWhereClause.payment_date.lte = endDate;
  }

  const payments = await prisma.wage_payments.findMany({
    where: paymentsWhereClause,
  });

  const totalPaid = payments.reduce((sum: number, p: PaymentRecord) => sum + p.amount, 0);

  return {
    worker_id: worker.id,
    worker_name: worker.name,
    total_earned: totalEarned,
    total_paid: totalPaid,
    unpaid_amount: totalEarned - totalPaid,
  };
};

/**
 * Get unpaid wages summary for all workers
 */
export const getAllUnpaidWages = async (
  departmentId?: number,
  startDate?: Date,
  endDate?: Date
): Promise<UnpaidWagesSummary[]> => {
  // Get all workers, optionally filtered by department
  const workersWhere: Prisma.workersWhereInput = {};
  if (departmentId) {
    workersWhere.department_id = departmentId;
  }

  const workers = await prisma.workers.findMany({
    where: workersWhere,
    select: { id: true, name: true },
  });

  const results: UnpaidWagesSummary[] = [];

  for (const worker of workers) {
    const unpaidData = await getUnpaidWages(worker.id, startDate, endDate);
    // Only include workers who have some earnings
    if (unpaidData.total_earned > 0) {
      results.push(unpaidData);
    }
  }

  // Sort by unpaid amount descending
  return results.sort((a, b) => b.unpaid_amount - a.unpaid_amount);
};

/**
 * Void a payment record (instead of deleting)
 * Voided payments are kept for audit trail but excluded from totals
 */
export const voidPayment = async (
  paymentId: number,
  voidReason: string,
  voidedBy?: number
) => {
  const payment = await prisma.wage_payments.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(`Payment with ID ${paymentId} not found`);
  }

  // Check if already voided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((payment as any).is_voided) {
    throw new Error("This payment has already been voided");
  }

  // Validate void reason
  if (!voidReason || voidReason.trim() === "") {
    throw new Error("Void reason is required");
  }

  // Void the payment (not delete)
  // Note: After running `npx prisma generate`, the type assertion can be removed
  const voidedPayment = await prisma.wage_payments.update({
    where: { id: paymentId },
    data: {
      is_voided: true,
      void_reason: voidReason.trim(),
      voided_by: voidedBy,
      voided_at: new Date(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    include: {
      worker: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    success: true,
    voided_id: paymentId,
    payment: voidedPayment,
  };
};

/**
 * @deprecated Use voidPayment instead - payments should not be deleted
 * Kept for backward compatibility but throws an error
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deletePayment = async (_paymentId: number) => {
  throw new Error(
    "Payment deletion is not allowed. Use voidPayment() instead to maintain audit trail."
  );
};

/**
 * Calculate wages for a worker in a date range (for DATE_RANGE payment type)
 * Returns calculated amount based on billable worker_logs
 */
export const calculateWagesForDateRange = async (
  workerId: number,
  startDate: Date,
  endDate: Date
) => {
  const logs = await prisma.worker_logs.findMany({
    where: {
      worker_id: workerId,
      is_billable: true,
      work_date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const totalAmount = logs.reduce((sum, log) => {
    return sum + (log.quantity_worked || 0) * (log.unit_price || 0);
  }, 0);

  const totalQuantity = logs.reduce((sum, log) => sum + (log.quantity_worked || 0), 0);

  return {
    worker_id: workerId,
    start_date: startDate,
    end_date: endDate,
    calculated_amount: totalAmount,
    total_quantity: totalQuantity,
    total_entries: logs.length,
    logs,
  };
};

/**
 * Calculate wages for a worker for a specific sub-batch (for SUB_BATCH payment type)
 */
export const calculateWagesForSubBatch = async (
  workerId: number,
  subBatchId: number
) => {
  const logs = await prisma.worker_logs.findMany({
    where: {
      worker_id: workerId,
      sub_batch_id: subBatchId,
      is_billable: true,
    },
    include: {
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const totalAmount = logs.reduce((sum, log) => {
    return sum + (log.quantity_worked || 0) * (log.unit_price || 0);
  }, 0);

  const totalQuantity = logs.reduce((sum, log) => sum + (log.quantity_worked || 0), 0);

  return {
    worker_id: workerId,
    sub_batch_id: subBatchId,
    sub_batch_name: logs[0]?.sub_batch?.name || "",
    calculated_amount: totalAmount,
    total_quantity: totalQuantity,
    total_entries: logs.length,
    logs,
  };
};

/**
 * Get sub-batches a worker has worked on (for SUB_BATCH payment type dropdown)
 */
export const getWorkerSubBatches = async (workerId: number) => {
  const logs = await prisma.worker_logs.findMany({
    where: {
      worker_id: workerId,
      is_billable: true,
    },
    select: {
      sub_batch_id: true,
      sub_batch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    distinct: ["sub_batch_id"],
  });

  // Get unique sub-batches with their calculated wages
  const subBatchMap = new Map<number, { id: number; name: string }>();
  logs.forEach((log) => {
    if (log.sub_batch && !subBatchMap.has(log.sub_batch.id)) {
      subBatchMap.set(log.sub_batch.id, {
        id: log.sub_batch.id,
        name: log.sub_batch.name,
      });
    }
  });

  return Array.from(subBatchMap.values());
};
