import { Request, Response } from "express";
import * as supervisorService from "../services/supervisorService";

export const createSupervisor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, departmentId } = req.body;

    if (!name || !email || !password || !departmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const supervisor = await supervisorService.createSupervisor({
      name,
      email,
      password,
      departmentId,
    });

    res.status(201).json({ success: true, data: supervisor });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
