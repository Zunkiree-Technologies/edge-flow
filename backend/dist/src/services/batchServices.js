"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBatch = exports.updateBatch = exports.getBatchById = exports.getAllBatches = exports.createBatch = void 0;
const db_1 = __importDefault(require("../config/db"));
const createBatch = async (data) => {
    const batchData = {
        name: data.name,
        quantity: data.quantity,
    };
    if (data.unit)
        batchData.unit = data.unit;
    if (data.color)
        batchData.color = data.color;
    if (data.roll_id)
        batchData.roll = { connect: { id: data.roll_id } };
    if (data.vendor_id)
        batchData.vendor = { connect: { id: data.vendor_id } };
    return await db_1.default.batches.create({
        data: batchData,
        include: { roll: true, vendor: true }, // include roll info if connected
    });
};
exports.createBatch = createBatch;
const getAllBatches = async () => {
    return await db_1.default.batches.findMany({
        include: { roll: true, vendor: true },
    });
};
exports.getAllBatches = getAllBatches;
const getBatchById = async (id) => {
    const batch = await db_1.default.batches.findUnique({
        where: { id },
        include: { roll: true, vendor: true },
    });
    if (!batch)
        throw new Error("Batch not found");
    return batch;
};
exports.getBatchById = getBatchById;
const updateBatch = async (id, data) => {
    const updateData = { ...data };
    if (data.roll_id) {
        updateData.roll = { connect: { id: data.roll_id } };
        delete updateData.roll_id; // remove to avoid conflict
    }
    if (data.vendor_id) {
        updateData.vendor = { connect: { id: data.vendor_id } };
        delete updateData.vendor_id;
    }
    return await db_1.default.batches.update({
        where: { id },
        data: updateData,
        include: { roll: true, vendor: true },
    });
};
exports.updateBatch = updateBatch;
const deleteBatch = async (id) => {
    return await db_1.default.batches.delete({
        where: { id },
    });
};
exports.deleteBatch = deleteBatch;
