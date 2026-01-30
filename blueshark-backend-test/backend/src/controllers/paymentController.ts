// src/controllers/paymentController.ts
import { Request, Response } from "express";
import {
  recordPayment,
  getPayments,
  getPaymentById,
  getPaymentsByWorker,
  getPaymentSummary,
  getUnpaidWages,
  getAllUnpaidWages,
  voidPayment,
  calculateWagesForDateRange,
  calculateWagesForSubBatch,
  getWorkerSubBatches,
  PaymentType,
  PaymentMethod,
} from "../services/paymentService";

/**
 * POST /api/payments
 * Record a new payment
 */
export const createPayment = async (req: Request, res: Response) => {
  try {
    const {
      worker_id,
      amount,
      payment_type,
      payment_method,
      payment_date,
      reference_number,
      remarks,
      start_date,
      end_date,
      sub_batch_id,
      recorded_by,
    } = req.body;

    // Validate required fields
    if (!worker_id || amount === undefined || !payment_type || !payment_method) {
      return res.status(400).json({
        error: "Missing required fields: worker_id, amount, payment_type, payment_method",
      });
    }

    // Validate payment_type
    const validPaymentTypes: PaymentType[] = ["DATE_RANGE", "SUB_BATCH", "DIRECT"];
    if (!validPaymentTypes.includes(payment_type)) {
      return res.status(400).json({
        error: `Invalid payment_type. Must be one of: ${validPaymentTypes.join(", ")}`,
      });
    }

    // Validate payment_method
    const validPaymentMethods: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "CHECK", "MOBILE_WALLET"];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        error: `Invalid payment_method. Must be one of: ${validPaymentMethods.join(", ")}`,
      });
    }

    const payment = await recordPayment({
      worker_id: parseInt(worker_id),
      amount: parseFloat(amount),
      payment_type,
      payment_method,
      payment_date: payment_date ? new Date(payment_date) : undefined,
      reference_number,
      remarks,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      sub_batch_id: sub_batch_id ? parseInt(sub_batch_id) : undefined,
      recorded_by: recorded_by ? parseInt(recorded_by) : undefined,
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to record payment" });
  }
};

/**
 * GET /api/payments
 * Get all payments with optional filters
 * Query params: worker_id, payment_type, payment_method, start_date, end_date
 */
export const listPayments = async (req: Request, res: Response) => {
  try {
    const {
      worker_id,
      payment_type,
      payment_method,
      start_date,
      end_date,
    } = req.query;

    const payments = await getPayments({
      worker_id: worker_id ? parseInt(worker_id as string) : undefined,
      payment_type: payment_type as PaymentType | undefined,
      payment_method: payment_method as PaymentMethod | undefined,
      start_date: start_date ? new Date(start_date as string) : undefined,
      end_date: end_date ? new Date(end_date as string) : undefined,
    });

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
};

/**
 * GET /api/payments/:id
 * Get a single payment by ID
 */
export const getPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);

    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "Invalid payment ID" });
    }

    const payment = await getPaymentById(paymentId);
    res.json(payment);
  } catch (error: any) {
    res.status(404).json({ error: error.message || "Payment not found" });
  }
};

/**
 * GET /api/payments/worker/:workerId
 * Get all payments for a specific worker
 */
export const getWorkerPayments = async (req: Request, res: Response) => {
  try {
    const workerId = parseInt(req.params.workerId);

    if (isNaN(workerId)) {
      return res.status(400).json({ error: "Invalid worker ID" });
    }

    const result = await getPaymentsByWorker(workerId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch worker payments" });
  }
};

/**
 * GET /api/payments/summary
 * Get payment summary for dashboard
 * Query params: department_id, start_date, end_date
 */
export const getSummary = async (req: Request, res: Response) => {
  try {
    const { department_id, start_date, end_date } = req.query;

    const summary = await getPaymentSummary(
      department_id ? parseInt(department_id as string) : undefined,
      start_date ? new Date(start_date as string) : undefined,
      end_date ? new Date(end_date as string) : undefined
    );

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get payment summary" });
  }
};

/**
 * GET /api/payments/unpaid
 * Get unpaid wages summary for all workers
 * Query params: department_id, start_date, end_date
 */
export const getUnpaid = async (req: Request, res: Response) => {
  try {
    const { department_id, start_date, end_date } = req.query;

    const unpaidList = await getAllUnpaidWages(
      department_id ? parseInt(department_id as string) : undefined,
      start_date ? new Date(start_date as string) : undefined,
      end_date ? new Date(end_date as string) : undefined
    );

    res.json(unpaidList);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get unpaid wages" });
  }
};

/**
 * GET /api/payments/unpaid/:workerId
 * Get unpaid wages for a specific worker
 * Query params: start_date, end_date
 */
export const getWorkerUnpaid = async (req: Request, res: Response) => {
  try {
    const workerId = parseInt(req.params.workerId);
    const { start_date, end_date } = req.query;

    if (isNaN(workerId)) {
      return res.status(400).json({ error: "Invalid worker ID" });
    }

    const unpaid = await getUnpaidWages(
      workerId,
      start_date ? new Date(start_date as string) : undefined,
      end_date ? new Date(end_date as string) : undefined
    );

    res.json(unpaid);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get unpaid wages" });
  }
};

/**
 * POST /api/payments/:id/void
 * Void a payment record (instead of deleting)
 * Body: { void_reason: string, voided_by?: number }
 */
export const voidPaymentHandler = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { void_reason, voided_by } = req.body;

    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "Invalid payment ID" });
    }

    if (!void_reason || void_reason.trim() === "") {
      return res.status(400).json({ error: "Void reason is required" });
    }

    const result = await voidPayment(
      paymentId,
      void_reason,
      voided_by ? parseInt(voided_by) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to void payment" });
  }
};

/**
 * @deprecated DELETE /api/payments/:id is no longer supported
 * Use POST /api/payments/:id/void instead
 */
export const removePayment = async (_req: Request, res: Response) => {
  return res.status(405).json({
    error: "Payment deletion is not allowed. Use POST /api/payments/:id/void instead to void the payment.",
  });
};

/**
 * GET /api/payments/calculate/date-range
 * Calculate wages for a worker in a date range (preview before recording payment)
 * Query params: worker_id, start_date, end_date (required)
 */
export const calculateDateRange = async (req: Request, res: Response) => {
  try {
    const { worker_id, start_date, end_date } = req.query;

    if (!worker_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "Missing required parameters: worker_id, start_date, end_date",
      });
    }

    const workerId = parseInt(worker_id as string);
    if (isNaN(workerId)) {
      return res.status(400).json({ error: "Invalid worker_id" });
    }

    const result = await calculateWagesForDateRange(
      workerId,
      new Date(start_date as string),
      new Date(end_date as string)
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to calculate wages" });
  }
};

/**
 * GET /api/payments/calculate/sub-batch
 * Calculate wages for a worker for a specific sub-batch (preview before recording payment)
 * Query params: worker_id, sub_batch_id (required)
 */
export const calculateSubBatch = async (req: Request, res: Response) => {
  try {
    const { worker_id, sub_batch_id } = req.query;

    if (!worker_id || !sub_batch_id) {
      return res.status(400).json({
        error: "Missing required parameters: worker_id, sub_batch_id",
      });
    }

    const workerId = parseInt(worker_id as string);
    const subBatchId = parseInt(sub_batch_id as string);

    if (isNaN(workerId)) {
      return res.status(400).json({ error: "Invalid worker_id" });
    }
    if (isNaN(subBatchId)) {
      return res.status(400).json({ error: "Invalid sub_batch_id" });
    }

    const result = await calculateWagesForSubBatch(workerId, subBatchId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to calculate wages" });
  }
};

/**
 * GET /api/payments/worker/:workerId/sub-batches
 * Get list of sub-batches a worker has worked on
 */
export const getWorkerSubBatchList = async (req: Request, res: Response) => {
  try {
    const workerId = parseInt(req.params.workerId);

    if (isNaN(workerId)) {
      return res.status(400).json({ error: "Invalid worker ID" });
    }

    const subBatches = await getWorkerSubBatches(workerId);
    res.json(subBatches);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch sub-batches" });
  }
};
