import express from "express";
import { signup, login, loginSupervisor } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Supervisor login
router.post("/supervisor-login", loginSupervisor);

export default router;
