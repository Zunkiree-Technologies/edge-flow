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
exports.fetchProductionSubBatches = exports.deleteWorkerFromDepartment = exports.getDepartmentSubBatches = exports.deleteDepartment = exports.updateDepartment = exports.getDepartmentById = exports.getAllDepartments = exports.createDepartment = void 0;
const departmentService = __importStar(require("../services/departmentService"));
const departmentService_1 = require("../services/departmentService");
const departmentService_2 = require("../services/departmentService");
const createDepartment = async (req, res) => {
    try {
        const department = await departmentService.createDepartment(req.body);
        res
            .status(201)
            .json({ message: "Department created successfully", department });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createDepartment = createDepartment;
const getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentService.getAllDepartments();
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllDepartments = getAllDepartments;
const getDepartmentById = async (req, res) => {
    try {
        const department = await departmentService.getDepartmentById(Number(req.params.id));
        res.json(department);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getDepartmentById = getDepartmentById;
const updateDepartment = async (req, res) => {
    try {
        const department = await departmentService.updateDepartment(Number(req.params.id), req.body);
        res.json({ message: "Department updated successfully", department });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res) => {
    try {
        const department = await departmentService.deleteDepartment(Number(req.params.id));
        res.json({ message: "Department deleted successfully", department });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.deleteDepartment = deleteDepartment;
const getDepartmentSubBatches = async (req, res) => {
    try {
        let departmentId = Number(req.params.id);
        // If supervisor, override departmentId with their assigned department
        if (req.user?.role === "SUPERVISOR") {
            departmentId = req.user.departmentId;
        }
        const result = await departmentService.getSubBatchesByDepartment(departmentId);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getDepartmentSubBatches = getDepartmentSubBatches;
// Remove worker from department
const deleteWorkerFromDepartment = async (req, res) => {
    try {
        const { departmentId, workerId } = req.body;
        if (!departmentId || !workerId) {
            return res
                .status(400)
                .json({ message: "departmentId and workerId are required" });
        }
        const result = await (0, departmentService_1.removeWorkerFromDepartment)(Number(departmentId), Number(workerId));
        if (result.count === 0) {
            return res
                .status(404)
                .json({ message: "Worker not found in this department" });
        }
        return res.json({ message: "Worker removed from department successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteWorkerFromDepartment = deleteWorkerFromDepartment;
// Get all the sub-batches that are sent to production
const fetchProductionSubBatches = async (req, res) => {
    try {
        const { departmentId } = req.params;
        if (!departmentId) {
            return res.status(400).json({ message: "departmentId is required" });
        }
        const subBatches = await (0, departmentService_2.getProductionSubBatches)(Number(departmentId));
        return res.json({
            message: "Production sub-batches fetched successfully",
            data: subBatches.map((dsb) => dsb.sub_batch), // send only sub_batches if frontend doesn’t need junction info
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.fetchProductionSubBatches = fetchProductionSubBatches;
