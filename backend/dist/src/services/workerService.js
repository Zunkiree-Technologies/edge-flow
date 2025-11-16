"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkersByDepartment = exports.deleteWorker = exports.updateWorker = exports.getWorkerById = exports.getAllWorkers = exports.createWorker = void 0;
const db_1 = __importDefault(require("../config/db"));
// ✅ Create Worker
const createWorker = async (data) => {
    return await db_1.default.workers.create({
        data,
    });
};
exports.createWorker = createWorker;
// ✅ Get All Workers
const getAllWorkers = async () => {
    return await db_1.default.workers.findMany({
        include: {
            department: true, // fetch department details
        },
    });
};
exports.getAllWorkers = getAllWorkers;
// ✅ Get Worker by ID
const getWorkerById = async (id) => {
    return await db_1.default.workers.findUnique({
        where: { id },
        include: {
            department: true,
        },
    });
};
exports.getWorkerById = getWorkerById;
// ✅ Update Worker
const updateWorker = async (id, data) => {
    return await db_1.default.workers.update({
        where: { id },
        data,
    });
};
exports.updateWorker = updateWorker;
// ✅ Delete Worker
const deleteWorker = async (id) => {
    return await db_1.default.workers.delete({
        where: { id },
    });
};
exports.deleteWorker = deleteWorker;
// ✅ Get Workers by Department ID
const getWorkersByDepartment = async (departmentId) => {
    return await db_1.default.workers.findMany({
        where: {
            department_id: departmentId,
        },
        include: {
            department: true, // Include department details
        },
        orderBy: {
            name: "asc", // Sort by name alphabetically
        },
    });
};
exports.getWorkersByDepartment = getWorkersByDepartment;
