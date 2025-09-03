// src/controllers/subBatchController.ts
import { Request, Response } from "express";
import * as subBatchService from "../services/subBatchService";

// Create Sub-Batch
export const createSubBatch = async (req: Request, res: Response) => {
  try {
    const result = await subBatchService.createSubBatch(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res
      .status(400)
      .json({
        message: "Error creating sub-batch",
        details: err.message || err,
      });
  }
};

// Get all Sub-Batches
export const getAllSubBatches = async (_req: Request, res: Response) => {
  try {
    const subBatches = await subBatchService.getAllSubBatches();
    res.json(subBatches);
  } catch (err: any) {
    res
      .status(500)
      .json({
        message: "Error fetching sub-batches",
        details: err.message || err,
      });
  }
};

// Get Sub-Batch by ID
export const getSubBatchById = async (req: Request, res: Response) => {
  try {
    const subBatch = await subBatchService.getSubBatchById(
      Number(req.params.id)
    );
    res.json(subBatch);
  } catch (err: any) {
    res
      .status(404)
      .json({ message: "Sub-batch not found", details: err.message || err });
  }
};

// Update Sub-Batch
export const updateSubBatch = async (req: Request, res: Response) => {
  try {
    const result = await subBatchService.updateSubBatch(
      Number(req.params.id),
      req.body
    );
    res.json(result);
  } catch (err: any) {
    res
      .status(400)
      .json({
        message: "Error updating sub-batch",
        details: err.message || err,
      });
  }
};

// Delete Sub-Batch
export const deleteSubBatch = async (req: Request, res: Response) => {
  try {
    const result = await subBatchService.deleteSubBatch(Number(req.params.id));
    res.json(result);
  } catch (err: any) {
    res
      .status(400)
      .json({
        message: "Error deleting sub-batch",
        details: err.message || err,
      });
  }
};
