import { Request, Response } from "express";
import * as authService from "../services/authService";

// Admin Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signupUser(email, password);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Admin Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
};

// Supervisor Login
export const loginSupervisor = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginSupervisor(email, password);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
};
