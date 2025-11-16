// src/controllers/adminProductionController.ts
import { Request, Response } from "express";
import * as adminProductionService from "../services/adminProductionService";

/**
 * Get task details for admin production view
 * GET /api/admin/production/task-details/:subBatchId?department_id={departmentId}
 */
export const getTaskDetails = async (req: Request, res: Response) => {
  try {
    const subBatchId = Number(req.params.subBatchId);
    const departmentId = Number(req.query.department_id);

    // Validation
    if (isNaN(subBatchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-batch ID",
      });
    }

    if (isNaN(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "department_id query parameter is required and must be a number",
      });
    }

    const result = await adminProductionService.getTaskDetails(subBatchId, departmentId);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error fetching task details",
    });
  }
};

/**
 * Reject sub-batch from admin production view
 * POST /api/admin/production/reject
 */
export const rejectSubBatch = async (req: Request, res: Response) => {
  try {
    const { sub_batch_id, from_department_id, return_to_department_id, quantity, reason } = req.body;

    // Validation
    if (!sub_batch_id || !from_department_id || !return_to_department_id || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: sub_batch_id, from_department_id, return_to_department_id, quantity, reason",
      });
    }

    const result = await adminProductionService.createRejection({
      sub_batch_id: Number(sub_batch_id),
      from_department_id: Number(from_department_id),
      return_to_department_id: Number(return_to_department_id),
      quantity: Number(quantity),
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Rejection recorded successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error recording rejection",
    });
  }
};

/**
 * Add alteration from admin production view
 * POST /api/admin/production/alteration
 */
export const addAlteration = async (req: Request, res: Response) => {
  try {
    const { sub_batch_id, from_department_id, return_to_department_id, quantity, note } = req.body;

    // Validation
    if (!sub_batch_id || !from_department_id || !return_to_department_id || !quantity || !note) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: sub_batch_id, from_department_id, return_to_department_id, quantity, note",
      });
    }

    const result = await adminProductionService.createAlteration({
      sub_batch_id: Number(sub_batch_id),
      from_department_id: Number(from_department_id),
      return_to_department_id: Number(return_to_department_id),
      quantity: Number(quantity),
      note,
    });

    res.status(201).json({
      success: true,
      message: "Alteration recorded successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error recording alteration",
    });
  }
};
