import { Request, Response } from "express";
import * as departmentService from "../services/departmentService";

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const dept = await departmentService.createDepartment(req.body);
    res.status(201).json({ message: "Department created", department: dept });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: "Error creating department", error: err.message });
  }
};

export const getAllDepartments = async (_req: Request, res: Response) => {
  try {
    const depts = await departmentService.getAllDepartments();
    res.json(depts);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error fetching departments", error: err.message });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const dept = await departmentService.getDepartmentById(
      Number(req.params.id)
    );
    res.json(dept);
  } catch (err: any) {
    res
      .status(404)
      .json({ message: "Department not found", error: err.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const dept = await departmentService.updateDepartment(
      Number(req.params.id),
      req.body
    );
    res.json({ message: "Department updated", department: dept });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: "Error updating department", error: err.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    await departmentService.deleteDepartment(Number(req.params.id));
    res.json({ message: "Department deleted successfully" });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: "Error deleting department", error: err.message });
  }
};
