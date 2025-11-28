// src/controllers/departmentSubBatchController.ts
import { Request, Response } from "express";
import * as departmentSubBatchService from "../services/departmentSubBatchService";

// Get all department_sub_batches entries (all sub-batches)
export const getAllDepartmentSubBatches = async (
  req: Request,
  res: Response
) => {
  try {
    const entries = await departmentSubBatchService.getAllDepartmentSubBatches();

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error fetching all department sub-batches",
    });
  }
};

// Get all department_sub_batches entries for a specific sub-batch
export const getAllEntriesForSubBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const subBatchId = Number(req.params.subBatchId);

    if (isNaN(subBatchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-batch ID",
      });
    }

    const entries = await departmentSubBatchService.getAllEntriesForSubBatch(subBatchId);

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error fetching department entries",
    });
  }
};

// Get all department_sub_batch_history entries
export const getAllDepartmentSubBatchHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const history = await departmentSubBatchService.getAllDepartmentSubBatchHistory();

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error fetching department sub-batch history",
    });
  }
};

// Get sub-batch history (completed departments with worker logs)
export const getSubBatchHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const subBatchId = Number(req.params.subBatchId);

    if (isNaN(subBatchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-batch ID",
      });
    }

    const history = await departmentSubBatchService.getSubBatchHistory(subBatchId);

    res.status(200).json({
      success: true,
      sub_batch_id: subBatchId,
      completed_departments_count: history.department_details.length,
      department_flow: history.department_flow,
      department_details: history.department_details,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error fetching sub-batch history",
    });
  }
};

// ✅ Assign worker to a department_sub_batch entry
export const assignWorkerToDepartmentSubBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const { departmentSubBatchId, workerId } = req.body;

    if (!departmentSubBatchId) {
      return res.status(400).json({
        success: false,
        message: "departmentSubBatchId is required",
      });
    }

    // workerId can be null (to unassign), so we only check if it's provided
    if (workerId !== null && workerId !== undefined && typeof workerId !== 'number') {
      return res.status(400).json({
        success: false,
        message: "workerId must be a number or null",
      });
    }

    const updated = await departmentSubBatchService.assignWorkerToDepartmentSubBatch(
      Number(departmentSubBatchId),
      workerId === null ? null : Number(workerId)
    );

    res.status(200).json({
      success: true,
      message: workerId ? "Worker assigned successfully" : "Worker unassigned successfully",
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error assigning worker",
    });
  }
};

// ==================== NEW WORKFLOW CONTROLLERS ====================

/**
 * Create initial parent card when sub-batch arrives at department
 * POST /api/department-sub-batches/receive
 */
export const createParentCardController = async (
  req: Request,
  res: Response
) => {
  try {
    const { subBatchId, departmentId, quantity, sentFromDepartmentId } = req.body;

    if (!subBatchId || typeof subBatchId !== 'number') {
      return res.status(400).json({
        success: false,
        message: "subBatchId is required and must be a number",
      });
    }

    if (!departmentId || typeof departmentId !== 'number') {
      return res.status(400).json({
        success: false,
        message: "departmentId is required and must be a number",
      });
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity is required and must be a positive number",
      });
    }

    const parent = await departmentSubBatchService.createParentCard(
      subBatchId,
      departmentId,
      quantity,
      sentFromDepartmentId
    );

    res.status(201).json({
      success: true,
      message: "Parent card created successfully",
      data: parent,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error creating parent card",
    });
  }
};

/**
 * Assign pieces from parent to worker (new workflow)
 * POST /api/department-sub-batch/:parentId/assign
 */
export const assignPiecesToWorkerController = async (
  req: Request,
  res: Response
) => {
  try {
    const parentId = Number(req.params.parentId);
    const { workerId, assignedQty } = req.body;

    if (isNaN(parentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent ID",
      });
    }

    if (!workerId || typeof workerId !== 'number') {
      return res.status(400).json({
        success: false,
        message: "workerId is required and must be a number",
      });
    }

    if (!assignedQty || typeof assignedQty !== 'number' || assignedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "assignedQty is required and must be a positive number",
      });
    }

    const child = await departmentSubBatchService.assignPiecesToWorker(
      parentId,
      workerId,
      assignedQty
    );

    res.status(201).json({
      success: true,
      message: "Worker assigned successfully",
      data: child,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error assigning pieces to worker",
    });
  }
};

/**
 * Update child work (worked and altered)
 * PATCH /api/department-sub-batch/child/:childId/work
 */
export const updateChildWorkController = async (
  req: Request,
  res: Response
) => {
  try {
    const childId = Number(req.params.childId);
    const { worked, altered } = req.body;

    if (isNaN(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child ID",
      });
    }

    if (typeof worked !== 'number' || worked < 0) {
      return res.status(400).json({
        success: false,
        message: "worked must be a non-negative number",
      });
    }

    if (typeof altered !== 'number' || altered < 0) {
      return res.status(400).json({
        success: false,
        message: "altered must be a non-negative number",
      });
    }

    const updatedChild = await departmentSubBatchService.updateChildWork(
      childId,
      worked,
      altered
    );

    res.status(200).json({
      success: true,
      message: "Child work updated successfully",
      data: updatedChild,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error updating child work",
    });
  }
};

/**
 * Forward child to next department
 * POST /api/department-sub-batch/child/:childId/forward
 */
export const forwardChildController = async (
  req: Request,
  res: Response
) => {
  try {
    const childId = Number(req.params.childId);
    const { targetDeptId } = req.body;

    if (isNaN(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child ID",
      });
    }

    if (!targetDeptId || typeof targetDeptId !== 'number') {
      return res.status(400).json({
        success: false,
        message: "targetDeptId is required and must be a number",
      });
    }

    const newParent = await departmentSubBatchService.forwardChild(
      childId,
      targetDeptId
    );

    res.status(201).json({
      success: true,
      message: "Child forwarded successfully",
      data: newParent,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error forwarding child",
    });
  }
};

/**
 * Delete child and restore parent
 * DELETE /api/department-sub-batch/child/:childId
 */
export const deleteChildController = async (
  req: Request,
  res: Response
) => {
  try {
    const childId = Number(req.params.childId);

    if (isNaN(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child ID",
      });
    }

    const updatedParent = await departmentSubBatchService.deleteChild(childId);

    res.status(200).json({
      success: true,
      message: "Child deleted successfully",
      data: updatedParent,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error deleting child",
    });
  }
};

/**
 * Get department cards (parent and children)
 * GET /api/department/:deptId/sub-batch/:subBatchId/cards
 */
export const getDepartmentCardsController = async (
  req: Request,
  res: Response
) => {
  try {
    const deptId = Number(req.params.deptId);
    const subBatchId = Number(req.params.subBatchId);

    if (isNaN(deptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    if (isNaN(subBatchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-batch ID",
      });
    }

    const cards = await departmentSubBatchService.getDepartmentCards(
      deptId,
      subBatchId
    );

    res.status(200).json({
      success: true,
      data: cards,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Error fetching department cards",
    });
  }
};
