import { Request, Response } from "express";
import * as subBatchService from "../services/subBatchService";

export const createSubBatch = async (req: Request, res: Response) => {
  try {
    const subBatch = await subBatchService.createSubBatch(req.body);
    res.status(201).json(subBatch);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Error creating sub-batch", error: error.message });
  }
};

export const getAllSubBatches = async (_req: Request, res: Response) => {
  try {
    const subBatches = await subBatchService.getAllSubBatches();
    res.json(subBatches);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Error fetching sub-batches", error: error.message });
  }
};

export const getSubBatchById = async (req: Request, res: Response) => {
  try {
    const subBatch = await subBatchService.getSubBatchById(
      Number(req.params.id)
    );
    res.json(subBatch);
  } catch (error: any) {
    res
      .status(404)
      .json({ message: "Sub-batch not found", error: error.message });
  }
};

export const updateSubBatch = async (req: Request, res: Response) => {
  try {
    const subBatch = await subBatchService.updateSubBatch(
      Number(req.params.id),
      req.body
    );
    res.json(subBatch);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Error updating sub-batch", error: error.message });
  }
};

export const deleteSubBatch = async (req: Request, res: Response) => {
  try {
    const subBatch = await subBatchService.deleteSubBatch(
      Number(req.params.id)
    );
    res.json(subBatch);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Error deleting sub-batch", error: error.message });
  }
};
