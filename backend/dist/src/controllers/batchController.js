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
exports.deleteBatch = exports.updateBatch = exports.getBatchById = exports.getBatches = exports.createBatch = void 0;
const batchService = __importStar(require("../services/batchServices"));
const createBatch = async (req, res) => {
    try {
        const batch = await batchService.createBatch(req.body);
        res.status(201).json(batch);
    }
    catch (err) {
        res.status(400).json({ message: "Error creating batch", error: err });
    }
};
exports.createBatch = createBatch;
const getBatches = async (req, res) => {
    try {
        const batches = await batchService.getAllBatches();
        res.json(batches);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching batches", error: err });
    }
};
exports.getBatches = getBatches;
const getBatchById = async (req, res) => {
    try {
        const batch = await batchService.getBatchById(Number(req.params.id));
        if (!batch)
            return res.status(404).json({ message: "Batch not found" });
        res.json(batch);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching batch", error: err });
    }
};
exports.getBatchById = getBatchById;
const updateBatch = async (req, res) => {
    try {
        const batch = await batchService.updateBatch(Number(req.params.id), req.body);
        res.json(batch);
    }
    catch (err) {
        res.status(400).json({ message: "Error updating batch", error: err });
    }
};
exports.updateBatch = updateBatch;
const deleteBatch = async (req, res) => {
    try {
        await batchService.deleteBatch(Number(req.params.id));
        res.json({ message: "Batch deleted successfully" });
    }
    catch (err) {
        res.status(400).json({ message: "Error deleting batch", error: err });
    }
};
exports.deleteBatch = deleteBatch;
