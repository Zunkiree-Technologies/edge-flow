"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubtraction = exports.getSubtractionById = exports.getSubtractionsByInventoryId = exports.getAllSubtractions = exports.createInventorySubtraction = void 0;
const db_1 = __importDefault(require("../config/db"));
// Create Inventory Subtraction and Update Main Inventory
const createInventorySubtraction = async (data) => {
    // Use a transaction to ensure both operations succeed or fail together
    return await db_1.default.$transaction(async (tx) => {
        // 1. Check if inventory exists and has enough quantity
        const inventory = await tx.inventory.findUnique({
            where: { id: data.inventory_id },
        });
        if (!inventory) {
            throw new Error("Inventory item not found");
        }
        if (inventory.quantity < data.quantity) {
            throw new Error(`Insufficient inventory. Available: ${inventory.quantity}, Requested: ${data.quantity}`);
        }
        // 2. Create subtraction record
        const subtraction = await tx.inventory_subtraction.create({
            data: {
                inventory_id: data.inventory_id,
                date: data.date || new Date(),
                quantity: data.quantity,
                remarks: data.remarks,
            },
            include: {
                inventory: true,
            },
        });
        // 3. Update inventory quantity (subtract)
        await tx.inventory.update({
            where: { id: data.inventory_id },
            data: {
                quantity: {
                    decrement: data.quantity,
                },
            },
        });
        return subtraction;
    });
};
exports.createInventorySubtraction = createInventorySubtraction;
// Get All Subtractions
const getAllSubtractions = async () => {
    return await db_1.default.inventory_subtraction.findMany({
        include: {
            inventory: true,
        },
        orderBy: {
            date: "desc",
        },
    });
};
exports.getAllSubtractions = getAllSubtractions;
// Get Subtractions by Inventory ID
const getSubtractionsByInventoryId = async (inventoryId) => {
    return await db_1.default.inventory_subtraction.findMany({
        where: {
            inventory_id: inventoryId,
        },
        include: {
            inventory: true,
        },
        orderBy: {
            date: "desc",
        },
    });
};
exports.getSubtractionsByInventoryId = getSubtractionsByInventoryId;
// Get Subtraction by ID
const getSubtractionById = async (id) => {
    return await db_1.default.inventory_subtraction.findUnique({
        where: { id },
        include: {
            inventory: true,
        },
    });
};
exports.getSubtractionById = getSubtractionById;
// Delete Subtraction (and optionally restore quantity)
const deleteSubtraction = async (id, restoreQuantity = true) => {
    return await db_1.default.$transaction(async (tx) => {
        // Get the subtraction record first
        const subtraction = await tx.inventory_subtraction.findUnique({
            where: { id },
        });
        if (!subtraction) {
            throw new Error("Subtraction record not found");
        }
        // If restoreQuantity is true, add the quantity back to inventory
        if (restoreQuantity) {
            await tx.inventory.update({
                where: { id: subtraction.inventory_id },
                data: {
                    quantity: {
                        increment: subtraction.quantity,
                    },
                },
            });
        }
        // Delete the subtraction record
        return await tx.inventory_subtraction.delete({
            where: { id },
        });
    });
};
exports.deleteSubtraction = deleteSubtraction;
