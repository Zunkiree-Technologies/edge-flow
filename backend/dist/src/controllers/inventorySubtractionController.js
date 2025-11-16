"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubtraction = exports.getSubtractionById = exports.getSubtractionsByInventoryId = exports.getAllSubtractions = exports.createSubtraction = void 0;
const inventorySubtractionService = __importStar(require("../services/inventorySubtractionService"));
const createSubtraction = async (req, res) => {
    try {
        const { date, ...rest } = req.body;
        const subtractionData = {
            ...rest,
            date: date ? new Date(date) : undefined,
        };
        const subtraction = await inventorySubtractionService.createInventorySubtraction(subtractionData);
        res.status(201).json(subtraction);
    }
    catch (error) {
        res.status(400).json({
            message: "Error creating inventory subtraction",
            error: error.message,
        });
    }
};
exports.createSubtraction = createSubtraction;
const getAllSubtractions = async (_req, res) => {
    try {
        const subtractions = await inventorySubtractionService.getAllSubtractions();
        res.json(subtractions);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching inventory subtractions",
            error: error.message,
        });
    }
};
exports.getAllSubtractions = getAllSubtractions;
const getSubtractionsByInventoryId = async (req, res) => {
    try {
        const inventoryId = Number(req.params.inventoryId);
        if (isNaN(inventoryId)) {
            return res.status(400).json({ message: "Invalid inventory ID" });
        }
        const subtractions = await inventorySubtractionService.getSubtractionsByInventoryId(inventoryId);
        res.json(subtractions);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching inventory subtractions",
            error: error.message,
        });
    }
};
exports.getSubtractionsByInventoryId = getSubtractionsByInventoryId;
const getSubtractionById = async (req, res) => {
    try {
        const subtraction = await inventorySubtractionService.getSubtractionById(Number(req.params.id));
        if (!subtraction) {
            return res.status(404).json({ message: "Subtraction record not found" });
        }
        res.json(subtraction);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching subtraction record",
            error: error.message,
        });
    }
};
exports.getSubtractionById = getSubtractionById;
const deleteSubtraction = async (req, res) => {
    try {
        const restoreQuantity = req.query.restore === "true";
        await inventorySubtractionService.deleteSubtraction(Number(req.params.id), restoreQuantity);
        res.json({
            message: `Subtraction deleted successfully${restoreQuantity ? " and quantity restored" : ""}`,
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Error deleting subtraction record",
            error: error.message,
        });
    }
};
exports.deleteSubtraction = deleteSubtraction;
