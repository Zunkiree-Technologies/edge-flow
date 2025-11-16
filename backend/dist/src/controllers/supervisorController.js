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
exports.getSupervisorSubBatches = exports.deleteSupervisor = exports.updateSupervisorController = exports.assignDepartment = exports.getSupervisors = exports.createSupervisor = void 0;
const supervisorService = __importStar(require("../services/supervisorService"));
const supervisorService_1 = require("../services/supervisorService");
const supervisorService_2 = require("../services/supervisorService");
const departmentService = __importStar(require("../services/departmentService"));
const createSupervisor = async (req, res) => {
    try {
        const { name, email, password, departmentId } = req.body;
        // Only check mandatory fields
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Missing fields" });
        }
        const supervisor = await supervisorService.createSupervisor({
            name,
            email,
            password,
            departmentId, // optional
        });
        res.status(201).json({ success: true, data: supervisor });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createSupervisor = createSupervisor;
// Get all supervisors
const getSupervisors = async (req, res) => {
    try {
        const supervisors = await supervisorService.getAllSupervisors();
        res.status(200).json({ success: true, data: supervisors });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSupervisors = getSupervisors;
const assignDepartment = async (req, res) => {
    try {
        const { supervisorId, departmentId } = req.body;
        const updatedSupervisor = await supervisorService.assignSupervisorToDepartment(supervisorId, departmentId);
        res.status(200).json({ success: true, supervisor: updatedSupervisor });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
exports.assignDepartment = assignDepartment;
const updateSupervisorController = async (req, res) => {
    try {
        const supervisorId = parseInt(req.params.id);
        const { name, email, newPassword } = req.body;
        if (!name && !email && !newPassword) {
            return res
                .status(400)
                .json({ message: "Provide at least one field to update" });
        }
        const updated = await (0, supervisorService_1.updateSupervisor)(supervisorId, {
            name,
            email,
            newPassword,
        });
        return res.json({
            message: "Supervisor updated successfully",
            supervisor: updated,
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.updateSupervisorController = updateSupervisorController;
// Delete supervisor
const deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        await (0, supervisorService_2.deleteSupervisorService)(parseInt(id));
        res.json({ message: "Supervisor deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting supervisor" });
    }
};
exports.deleteSupervisor = deleteSupervisor;
const getSupervisorSubBatches = async (req, res) => {
    try {
        const supervisorId = req.user?.userId; // get supervisorId from auth middleware
        if (!supervisorId) {
            return res.status(400).json({ message: "Supervisor ID is required" });
        }
        const subBatches = await departmentService.getSubBatchesByDepartment(supervisorId);
        return res.status(200).json({
            success: true,
            message: "Sub-batches fetched successfully",
            data: subBatches,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSupervisorSubBatches = getSupervisorSubBatches;
