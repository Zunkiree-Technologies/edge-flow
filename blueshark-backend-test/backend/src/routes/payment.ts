// src/routes/payment.ts
import express from "express";
import {
  createPayment,
  listPayments,
  getPayment,
  getWorkerPayments,
  getSummary,
  getUnpaid,
  getWorkerUnpaid,
  removePayment,
  voidPaymentHandler,
  calculateDateRange,
  calculateSubBatch,
  getWorkerSubBatchList,
} from "../controllers/paymentController";

const router = express.Router();

/**
 * Payment Tracking Routes
 *
 * These endpoints manage wage payment records,
 * allowing tracking of payments made to workers.
 */

// Get payment summary for dashboard
// GET /api/payments/summary?department_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/summary", getSummary);

// Get unpaid wages summary for all workers
// GET /api/payments/unpaid?department_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/unpaid", getUnpaid);

// Get unpaid wages for a specific worker
// GET /api/payments/unpaid/:workerId?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/unpaid/:workerId", getWorkerUnpaid);

// Calculate wages for date range (preview before payment)
// GET /api/payments/calculate/date-range?worker_id=X&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/calculate/date-range", calculateDateRange);

// Calculate wages for sub-batch (preview before payment)
// GET /api/payments/calculate/sub-batch?worker_id=X&sub_batch_id=Y
router.get("/calculate/sub-batch", calculateSubBatch);

// Get sub-batches a worker has worked on
// GET /api/payments/worker/:workerId/sub-batches
router.get("/worker/:workerId/sub-batches", getWorkerSubBatchList);

// Get all payments for a specific worker
// GET /api/payments/worker/:workerId
router.get("/worker/:workerId", getWorkerPayments);

// Get all payments with filters
// GET /api/payments?worker_id=X&payment_type=DATE_RANGE&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
router.get("/", listPayments);

// Get a single payment by ID
// GET /api/payments/:id
router.get("/:id", getPayment);

// Record a new payment
// POST /api/payments
router.post("/", createPayment);

// Void a payment (instead of deleting)
// POST /api/payments/:id/void
// Body: { void_reason: string, voided_by?: number }
router.post("/:id/void", voidPaymentHandler);

// @deprecated - Delete is no longer supported (returns 405)
// Use POST /api/payments/:id/void instead
router.delete("/:id", removePayment);

export default router;
