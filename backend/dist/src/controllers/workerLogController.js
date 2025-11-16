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
exports.getWorkerLogsBySubBatch = exports.deleteWorkerLogController = exports.updateWorkerLogController = exports.getWorkerLogByIdController = exports.getAllWorkerLogsController = exports.createWorkerLogController = void 0;
const workerLogService_1 = require("../services/workerLogService");
const workerLogService = __importStar(require("../services/workerLogService"));
// ✅ Create
const createWorkerLogController = async (req, res) => {
    try {
        const log = await (0, workerLogService_1.createWorkerLog)(req.body);
        res.status(201).json(log);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createWorkerLogController = createWorkerLogController;
// ✅ Read all
const getAllWorkerLogsController = async (req, res) => {
    try {
        const logs = await (0, workerLogService_1.getAllWorkerLogs)();
        res.json(logs);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAllWorkerLogsController = getAllWorkerLogsController;
// ✅ Read one
const getWorkerLogByIdController = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const log = await (0, workerLogService_1.getWorkerLogById)(id);
        if (!log)
            return res.status(404).json({ error: "Worker log not found" });
        res.json(log);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getWorkerLogByIdController = getWorkerLogByIdController;
// ✅ Update
const updateWorkerLogController = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const log = await (0, workerLogService_1.updateWorkerLog)(id, req.body);
        res.json(log);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateWorkerLogController = updateWorkerLogController;
// ✅ Delete
const deleteWorkerLogController = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await (0, workerLogService_1.deleteWorkerLog)(id);
        res.json({ message: "Worker log deleted successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteWorkerLogController = deleteWorkerLogController;
const getWorkerLogsBySubBatch = async (req, res) => {
    try {
        const sub_batch_id = parseInt(req.params.subBatchId);
        if (isNaN(sub_batch_id)) {
            return res.status(400).json({ error: "Invalid sub_batch_id" });
        }
        const logs = await workerLogService.getWorkerLogsBySubBatch(sub_batch_id);
        res.status(200).json({ success: true, data: logs });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.getWorkerLogsBySubBatch = getWorkerLogsBySubBatch;
