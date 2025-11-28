import { Router } from "express";
import * as inventorySubtractionController from "../controllers/inventorySubtractionController";

const router = Router();

router.post("/", inventorySubtractionController.createSubtraction); // Create subtraction
router.get("/", inventorySubtractionController.getAllSubtractions); // Get all subtractions
router.get("/inventory/:inventoryId", inventorySubtractionController.getSubtractionsByInventoryId); // Get subtractions by inventory ID
router.get("/:id", inventorySubtractionController.getSubtractionById); // Get single subtraction
router.delete("/:id", inventorySubtractionController.deleteSubtraction); // Delete subtraction

export default router;
