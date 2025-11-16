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
exports.getWorkersByDepartment = exports.deleteWorker = exports.updateWorker = exports.getWorkerById = exports.getAllWorkers = exports.createWorker = void 0;
const workerService = __importStar(require("../services/workerService"));
const createWorker = async (req, res) => {
    try {
        const worker = await workerService.createWorker(req.body);
        res.status(201).json(worker);
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Error creating worker", error: error.message });
    }
};
exports.createWorker = createWorker;
const getAllWorkers = async (_req, res) => {
    try {
        const workers = await workerService.getAllWorkers();
        res.json(workers);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching workers", error: error.message });
    }
};
exports.getAllWorkers = getAllWorkers;
const getWorkerById = async (req, res) => {
    try {
        const worker = await workerService.getWorkerById(Number(req.params.id));
        if (!worker)
            return res.status(404).json({ message: "Worker not found" });
        res.json(worker);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching worker", error: error.message });
    }
};
exports.getWorkerById = getWorkerById;
const updateWorker = async (req, res) => {
    try {
        const worker = await workerService.updateWorker(Number(req.params.id), req.body);
        res.json(worker);
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Error updating worker", error: error.message });
    }
};
exports.updateWorker = updateWorker;
const deleteWorker = async (req, res) => {
    try {
        await workerService.deleteWorker(Number(req.params.id));
        res.json({ message: "Worker deleted successfully" });
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Error deleting worker", error: error.message });
    }
};
exports.deleteWorker = deleteWorker;
const getWorkersByDepartment = async (req, res) => {
    try {
        const departmentId = Number(req.params.departmentId);
        if (isNaN(departmentId)) {
            return res.status(400).json({ message: "Invalid department ID" });
        }
        const workers = await workerService.getWorkersByDepartment(departmentId);
        res.json(workers);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching workers by department", error: error.message });
    }
};
exports.getWorkersByDepartment = getWorkersByDepartment;
