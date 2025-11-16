"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddition = exports.getAdditionById = exports.getAdditionsByInventoryId = exports.getAllAdditions = exports.createInventoryAddition = exports.deleteInventory = exports.updateInventory = exports.getInventoryById = exports.getAllInventory = exports.createInventory = void 0;
const db_1 = __importDefault(require("../config/db"));
// Create Inventory Item
const createInventory = async (data) => {
    return await db_1.default.inventory.create({
        data,
    });
};
exports.createInventory = createInventory;
// Get All Inventory Items
const getAllInventory = async () => {
    return await db_1.default.inventory.findMany({
        orderBy: {
            date: "desc", // Sort by date, newest first
        },
    });
};
exports.getAllInventory = getAllInventory;
// Get Inventory Item by ID
const getInventoryById = async (id) => {
    return await db_1.default.inventory.findUnique({
        where: { id },
    });
};
exports.getInventoryById = getInventoryById;
// Update Inventory Item
const updateInventory = async (id, data) => {
    return await db_1.default.inventory.update({
        where: { id },
        data,
    });
};
exports.updateInventory = updateInventory;
// Delete Inventory Item
const deleteInventory = async (id) => {
    return await db_1.default.inventory.delete({
        where: { id },
    });
};
exports.deleteInventory = deleteInventory;
// Create Inventory Addition and Update Main Inventory
const createInventoryAddition = async (data) => {
    // Use a transaction to ensure both operations succeed or fail together
    return await db_1.default.$transaction(async (tx) => {
        // 1. Check if inventory exists
        const inventory = await tx.inventory.findUnique({
            where: { id: data.inventory_id },
        });
        if (!inventory) {
            throw new Error("Inventory item not found");
        }
        // 2. Create addition record
        const addition = await tx.inventory_addition.create({
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
        // 3. Update inventory quantity (add)
        await tx.inventory.update({
            where: { id: data.inventory_id },
            data: {
                quantity: {
                    increment: data.quantity,
                },
            },
        });
        return addition;
    });
};
exports.createInventoryAddition = createInventoryAddition;
// Get All Additions
const getAllAdditions = async () => {
    return await db_1.default.inventory_addition.findMany({
        include: {
            inventory: true,
        },
        orderBy: {
            date: "desc",
        },
    });
};
exports.getAllAdditions = getAllAdditions;
// Get Additions by Inventory ID
const getAdditionsByInventoryId = async (inventoryId) => {
    return await db_1.default.inventory_addition.findMany({
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
exports.getAdditionsByInventoryId = getAdditionsByInventoryId;
// Get Addition by ID
const getAdditionById = async (id) => {
    return await db_1.default.inventory_addition.findUnique({
        where: { id },
        include: {
            inventory: true,
        },
    });
};
exports.getAdditionById = getAdditionById;
// Delete Addition (and optionally remove quantity)
const deleteAddition = async (id, removeQuantity = true) => {
    return await db_1.default.$transaction(async (tx) => {
        // Get the addition record first
        const addition = await tx.inventory_addition.findUnique({
            where: { id },
        });
        if (!addition) {
            throw new Error("Addition record not found");
        }
        // If removeQuantity is true, subtract the quantity back from inventory
        if (removeQuantity) {
            await tx.inventory.update({
                where: { id: addition.inventory_id },
                data: {
                    quantity: {
                        decrement: addition.quantity,
                    },
                },
            });
        }
        // Delete the addition record
        return await tx.inventory_addition.delete({
            where: { id },
        });
    });
};
exports.deleteAddition = deleteAddition;
