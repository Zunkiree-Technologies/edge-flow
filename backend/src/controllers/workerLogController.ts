// src/controllers/workerLogController.ts
import { Request, Response } from "express";
import {
  createWorkerLog,
  getAllWorkerLogs,
  getWorkerLogById,
  updateWorkerLog,
  deleteWorkerLog,
} from "../services/workerLogService";
import * as workerLogService from "../services/workerLogService";

// ✅ Create
export const createWorkerLogController = async (
  req: Request,
  res: Response
) => {
  try {
    const log = await createWorkerLog(req.body);
    res.status(201).json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Read all
export const getAllWorkerLogsController = async (
  req: Request,
  res: Response
) => {
  try {
    const logs = await getAllWorkerLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read one
export const getWorkerLogByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const log = await getWorkerLogById(id);
    if (!log) return res.status(404).json({ error: "Worker log not found" });
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update
export const updateWorkerLogController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const log = await updateWorkerLog(id, req.body);
    res.json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete
export const deleteWorkerLogController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    await deleteWorkerLog(id);
    res.json({ message: "Worker log deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const getWorkerLogsBySubBatch = async (req: Request, res: Response) => {
  try {
    const sub_batch_id = parseInt(req.params.subBatchId);
    if (isNaN(sub_batch_id)) {
      return res.status(400).json({ error: "Invalid sub_batch_id" });
    }

    const logs = await workerLogService.getWorkerLogsBySubBatch(sub_batch_id);
    res.status(200).json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};