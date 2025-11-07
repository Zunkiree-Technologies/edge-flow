// src/controllers/departmentSubBatchController.ts
import { Request, Response } from "express";
import * as departmentSubBatchService from "../services/departmentSubBatchService";

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
