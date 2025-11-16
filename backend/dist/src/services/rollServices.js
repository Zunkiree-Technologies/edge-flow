"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoll = exports.updateRoll = exports.getRollById = exports.getAllRolls = exports.createRoll = void 0;
const db_1 = __importDefault(require("../config/db"));
const createRoll = async (data) => {
    const rollData = {
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        color: data.color,
    };
    if (data.vendor_id) {
        rollData.vendor = { connect: { id: data.vendor_id } };
    }
    if (data.batch_ids?.length) {
        rollData.batches = {
            connect: data.batch_ids.map((id) => ({ id })),
        };
    }
    if (data.sub_batch_ids?.length) {
        rollData.sub_batches = {
            connect: data.sub_batch_ids.map((id) => ({ id })),
        };
    }
    return await db_1.default.rolls.create({
        data: rollData,
        include: {
            vendor: true,
            batches: true,
            sub_batches: true,
        },
    });
};
exports.createRoll = createRoll;
const getAllRolls = async () => {
    return await db_1.default.rolls.findMany({
        include: {
            vendor: true,
            batches: true,
            sub_batches: true,
        },
    });
};
exports.getAllRolls = getAllRolls;
const getRollById = async (id) => {
    const roll = await db_1.default.rolls.findUnique({
        where: { id },
        include: {
            vendor: true,
            batches: true,
            sub_batches: true,
        },
    });
    if (!roll)
        throw new Error("Roll not found");
    return roll;
};
exports.getRollById = getRollById;
const updateRoll = async (id, data) => {
    const updateData = { ...data };
    if (data.vendor_id) {
        updateData.vendor = { connect: { id: data.vendor_id } };
        delete updateData.vendor_id;
    }
    if (data.batch_ids?.length) {
        updateData.batches = { connect: data.batch_ids.map((id) => ({ id })) };
        delete updateData.batch_ids;
    }
    if (data.sub_batch_ids?.length) {
        updateData.sub_batches = {
            connect: data.sub_batch_ids.map((id) => ({ id })),
        };
        delete updateData.sub_batch_ids;
    }
    return await db_1.default.rolls.update({
        where: { id },
        data: updateData,
        include: {
            vendor: true,
            batches: true,
            sub_batches: true,
        },
    });
};
exports.updateRoll = updateRoll;
const deleteRoll = async (id) => {
    return await db_1.default.rolls.delete({ where: { id } });
};
exports.deleteRoll = deleteRoll;
