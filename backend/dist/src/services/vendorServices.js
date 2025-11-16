"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendor = exports.updateVendor = exports.getVendorById = exports.getAllVendors = exports.createVendor = void 0;
const db_1 = __importDefault(require("../config/db"));
const createVendor = async (data) => {
    const vendorData = {
        name: data.name,
        vat_pan: data.vat_pan,
        address: data.address,
        phone: data.phone,
        comment: data.comment,
    };
    if (data.roll_ids && data.roll_ids.length > 0) {
        vendorData.rolls = { connect: data.roll_ids.map((id) => ({ id })) };
    }
    if (data.batch_ids && data.batch_ids.length > 0) {
        vendorData.batches = { connect: data.batch_ids.map((id) => ({ id })) };
    }
    return await db_1.default.vendors.create({
        data: vendorData,
        include: { rolls: true, batches: true },
    });
};
exports.createVendor = createVendor;
const getAllVendors = async () => {
    return await db_1.default.vendors.findMany({
        include: { rolls: true, batches: true },
    });
};
exports.getAllVendors = getAllVendors;
const getVendorById = async (id) => {
    const vendor = await db_1.default.vendors.findUnique({
        where: { id },
        include: { rolls: true, batches: true },
    });
    if (!vendor)
        throw new Error("Vendor not found");
    return vendor;
};
exports.getVendorById = getVendorById;
const updateVendor = async (id, data) => {
    const updateData = { ...data };
    if (data.roll_ids && data.roll_ids.length > 0) {
        updateData.rolls = { connect: data.roll_ids.map((id) => ({ id })) };
        delete updateData.roll_ids;
    }
    if (data.batch_ids && data.batch_ids.length > 0) {
        updateData.batches = { connect: data.batch_ids.map((id) => ({ id })) };
        delete updateData.batch_ids;
    }
    return await db_1.default.vendors.update({
        where: { id },
        data: updateData,
        include: { rolls: true, batches: true },
    });
};
exports.updateVendor = updateVendor;
const deleteVendor = async (id) => {
    return await db_1.default.vendors.delete({ where: { id } });
};
exports.deleteVendor = deleteVendor;
