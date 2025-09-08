import { Request, Response } from "express";
import * as supervisorService from "../services/supervisorService";

export const createSupervisor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, departmentId } = req.body;

    // Only check mandatory fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const supervisor = await supervisorService.createSupervisor({
      name,
      email,
      password,
      departmentId, // optional
    });

    res.status(201).json({ success: true, data: supervisor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all supervisors
export const getSupervisors = async (req: Request, res: Response) => {
  try {
    const supervisors = await supervisorService.getAllSupervisors();
    res.status(200).json({ success: true, data: supervisors });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignDepartment = async (req: Request, res: Response) => {
  try {
    const { supervisorId, departmentId } = req.body;
    const updatedSupervisor = await supervisorService.assignSupervisorToDepartment(
      supervisorId,
      departmentId
    );
    res.status(200).json({ success: true, supervisor: updatedSupervisor });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};