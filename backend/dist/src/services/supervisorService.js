"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupervisorService = exports.updateSupervisor = exports.getAllSupervisors = exports.assignSupervisorToDepartment = void 0;
exports.createSupervisor = createSupervisor;
exports.getSubBatchesByDepartment = getSubBatchesByDepartment;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createSupervisor(data) {
    const hashed = await bcrypt_1.default.hash(data.password, 10);
    const supervisor = await db_1.default.supervisor.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashed,
            // Only connect department if departmentId is provided
            department: data.departmentId
                ? { connect: { id: data.departmentId } }
                : undefined,
        },
        include: { department: true },
    });
    return supervisor;
}
const assignSupervisorToDepartment = async (supervisorId, departmentId) => {
    return await db_1.default.supervisor.update({
        where: { id: supervisorId },
        data: { department: { connect: { id: departmentId } } },
        include: { department: true },
    });
};
exports.assignSupervisorToDepartment = assignSupervisorToDepartment;
const getAllSupervisors = async () => {
    return await db_1.default.supervisor.findMany({
        include: { department: true }, // so we also see assigned department
    });
};
exports.getAllSupervisors = getAllSupervisors;
const updateSupervisor = async (supervisorId, data) => {
    const supervisor = await db_1.default.supervisor.findUnique({
        where: { id: supervisorId },
    });
    if (!supervisor) {
        throw new Error("Supervisor not found");
    }
    const updateData = {};
    if (data.name)
        updateData.name = data.name;
    if (data.email)
        updateData.email = data.email;
    if (data.newPassword) {
        updateData.password = await bcrypt_1.default.hash(data.newPassword, 10);
    }
    return await db_1.default.supervisor.update({
        where: { id: supervisorId },
        data: updateData,
        select: { id: true, name: true, email: true },
    });
};
exports.updateSupervisor = updateSupervisor;
const deleteSupervisorService = async (id) => {
    return db_1.default.supervisor.delete({
        where: { id },
    });
};
exports.deleteSupervisorService = deleteSupervisorService;
// Get sub-batches by department (for supervisor's assigned department)
async function getSubBatchesByDepartment(supervisorId) {
    // Step 1: Get the department for this supervisor
    const department = await db_1.default.departments.findFirst({
        where: { supervisor: { id: supervisorId } },
    });
    if (!department) {
        throw new Error("Supervisor is not assigned to any department");
    }
    // Step 2: Fetch sub-batches for this department
    const subs = await db_1.default.department_sub_batches.findMany({
        where: {
            department_id: department.id,
            is_current: true,
        },
        include: {
            sub_batch: {
                include: {
                    size_details: true,
                    attachments: true,
                    batch: true,
                },
            },
            assigned_worker: true,
            department: true,
        },
    });
    // Step 3: Return in Kanban style
    return {
        newArrival: subs.filter((s) => s.stage === "NEW_ARRIVAL"),
        inProgress: subs.filter((s) => s.stage === "IN_PROGRESS"),
        completed: subs.filter((s) => s.stage === "COMPLETED"),
    };
}
