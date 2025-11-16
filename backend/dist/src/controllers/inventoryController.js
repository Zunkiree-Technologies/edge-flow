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
exports.deleteAddition = exports.getAdditionById = exports.getAdditionsByInventoryId = exports.getAllAdditions = exports.createAddition = exports.deleteInventory = exports.updateInventory = exports.getInventoryById = exports.getAllInventory = exports.createInventory = void 0;
const inventoryService = __importStar(require("../services/inventoryService"));
const createInventory = async (req, res) => {
    try {
        const { date, ...rest } = req.body;
        const inventoryData = {
            ...rest,
            date: date ? new Date(date) : undefined,
        };
        const inventory = await inventoryService.createInventory(inventoryData);
        res.status(201).json(inventory);
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Error creating inventory item", error: error.message });
    }
};
exports.createInventory = createInventory;
const getAllInventory = async (_req, res) => {
    try {
        const inventory = await inventoryService.getAllInventory();
        res.json(inventory);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching inventory", error: error.message });
    }
};
exports.getAllInventory = getAllInventory;
const getInventoryById = async (req, res) => {
    try {
        const inventory = await inventoryService.getInventoryById(Number(req.params.id));
        if (!inventory)
            return res.status(404).json({ message: "Inventory item not found" });
        res.json(inventory);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching inventory item", error: error.message });
    }
};
exports.getInventoryById = getInventoryById;
const updateInventory = async (req, res) => {
    try {
        const { date, ...rest } = req.body;
        const updateData = {
            ...rest,
            date: date ? new Date(date) : undefined,
        };
        const inventory = await inventoryService.updateInventory(Number(req.params.id), updateData);
        res.json(inventory);
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Error updating inventory item", error: error.message });
    }
};
exports.updateInventory = updateInventory;
const deleteInventory = async (req, res) => {
    try {
        await inventoryService.deleteInventory(Number(req.params.id));
        res.json({ message: "Inventory item deleted successfully" });
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Error deleting inventory item", error: error.message });
    }
};
exports.deleteInventory = deleteInventory;
// Addition Controllers
const createAddition = async (req, res) => {
    try {
        const { date, ...rest } = req.body;
        const additionData = {
            ...rest,
            date: date ? new Date(date) : undefined,
        };
        const addition = await inventoryService.createInventoryAddition(additionData);
        res.status(201).json(addition);
    }
    catch (error) {
        res.status(400).json({
            message: "Error creating inventory addition",
            error: error.message,
        });
    }
};
exports.createAddition = createAddition;
const getAllAdditions = async (_req, res) => {
    try {
        const additions = await inventoryService.getAllAdditions();
        res.json(additions);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching inventory additions",
            error: error.message,
        });
    }
};
exports.getAllAdditions = getAllAdditions;
const getAdditionsByInventoryId = async (req, res) => {
    try {
        const inventoryId = Number(req.params.inventoryId);
        if (isNaN(inventoryId)) {
            return res.status(400).json({ message: "Invalid inventory ID" });
        }
        const additions = await inventoryService.getAdditionsByInventoryId(inventoryId);
        res.json(additions);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching inventory additions",
            error: error.message,
        });
    }
};
exports.getAdditionsByInventoryId = getAdditionsByInventoryId;
const getAdditionById = async (req, res) => {
    try {
        const addition = await inventoryService.getAdditionById(Number(req.params.id));
        if (!addition) {
            return res.status(404).json({ message: "Addition record not found" });
        }
        res.json(addition);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching addition record",
            error: error.message,
        });
    }
};
exports.getAdditionById = getAdditionById;
const deleteAddition = async (req, res) => {
    try {
        const removeQuantity = req.query.remove === "true";
        await inventoryService.deleteAddition(Number(req.params.id), removeQuantity);
        res.json({
            message: `Addition deleted successfully${removeQuantity ? " and quantity removed" : ""}`,
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Error deleting addition record",
            error: error.message,
        });
    }
};
exports.deleteAddition = deleteAddition;
