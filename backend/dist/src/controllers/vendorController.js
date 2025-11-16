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
exports.deleteVendor = exports.updateVendor = exports.getVendorById = exports.getAllVendors = exports.createVendor = void 0;
const vendorService = __importStar(require("../services/vendorServices"));
const createVendor = async (req, res) => {
    try {
        const vendor = await vendorService.createVendor(req.body);
        res.status(201).json(vendor);
    }
    catch (err) {
        res
            .status(400)
            .json({ message: "Error creating vendor", error: err.message });
    }
};
exports.createVendor = createVendor;
const getAllVendors = async (req, res) => {
    try {
        const vendors = await vendorService.getAllVendors();
        res.status(200).json(vendors);
    }
    catch (err) {
        res
            .status(400)
            .json({ message: "Error fetching vendors", error: err.message });
    }
};
exports.getAllVendors = getAllVendors;
const getVendorById = async (req, res) => {
    try {
        const vendor = await vendorService.getVendorById(Number(req.params.id));
        res.status(200).json(vendor);
    }
    catch (err) {
        res.status(404).json({ message: "Vendor not found", error: err.message });
    }
};
exports.getVendorById = getVendorById;
const updateVendor = async (req, res) => {
    try {
        const vendor = await vendorService.updateVendor(Number(req.params.id), req.body);
        res.status(200).json(vendor);
    }
    catch (err) {
        res
            .status(400)
            .json({ message: "Error updating vendor", error: err.message });
    }
};
exports.updateVendor = updateVendor;
const deleteVendor = async (req, res) => {
    try {
        await vendorService.deleteVendor(Number(req.params.id));
        res.status(200).json({ message: "Vendor deleted successfully" });
    }
    catch (err) {
        res
            .status(400)
            .json({ message: "Error deleting vendor", error: err.message });
    }
};
exports.deleteVendor = deleteVendor;
