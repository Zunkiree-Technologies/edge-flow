"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductionSubBatches = exports.removeWorkerFromDepartment = exports.deleteDepartment = exports.updateDepartment = exports.getDepartmentById = exports.getAllDepartments = exports.createDepartment = void 0;
exports.getSubBatchesByDepartment = getSubBatchesByDepartment;
const db_1 = __importDefault(require("../config/db"));
const departmentInclude = {
    sub_batches: {
        include: {
            size_details: true,
            attachments: true,
            rejected: true,
            altered: true,
            dept_links: true,
            worker_logs: true,
            roll: true,
            batch: true,
            department: true,
        },
    },
    workers: true,
    dept_workers: true,
    dept_batches: true,
    rejected: true,
    altered: true,
};
const createDepartment = async (data) => {
    const deptData = {
        name: data.name,
        remarks: data.remarks,
        ...(data.sub_batches?.length
            ? {
                sub_batches: {
                    connect: data.sub_batches.map((sb) => ({ id: sb.id })),
                },
            }
            : {}),
        ...(data.workers?.length
            ? {
                dept_workers: {
                    create: data.workers.map((w) => ({
                        worker_id: w.id,
                        assigned_date: w.assignedDate
                            ? new Date(w.assignedDate)
                            : new Date(),
                    })),
                },
            }
            : {}),
        ...(data.supervisorId
            ? { supervisor: { connect: { id: data.supervisorId } } }
            : {}), // <-- link supervisor if ID is provided
    };
    return await db_1.default.departments.create({
        data: deptData,
        include: departmentInclude,
    });
};
exports.createDepartment = createDepartment;
const getAllDepartments = async () => {
    return await db_1.default.departments.findMany({
        include: {
            supervisor: true, // fetch supervisor linked to department
            sub_batches: {
                include: {
                    attachments: true, // fetch attachments inside each sub_batch
                    size_details: true, // fetch size details of each sub_batch
                },
            },
            workers: true, // fetch all workers in department
            dept_workers: {
                include: {
                    worker: true, // also fetch worker info linked
                },
            },
            dept_batches: true, // fetch department_batches
            rejected: true, // rejected sub-batches linked
            altered: true, // altered sub-batches linked
            workflow_steps: true, // workflow steps of this department
            sub_batch_steps: true, // sub-batch workflow steps linked
        },
    });
};
exports.getAllDepartments = getAllDepartments;
const getDepartmentById = async (id) => {
    const department = await db_1.default.departments.findUnique({
        where: { id },
        include: {
            supervisor: true,
            sub_batches: {
                include: {
                    attachments: true,
                    size_details: true,
                },
            },
            workers: true,
            dept_workers: {
                include: { worker: true },
            },
            dept_batches: true,
            rejected: true,
            altered: true,
            workflow_steps: true,
            sub_batch_steps: true,
        },
    });
    if (!department)
        throw new Error("Department not found");
    return department;
};
exports.getDepartmentById = getDepartmentById;
const updateDepartment = async (id, data) => {
    const updateData = {
        name: data.name,
        remarks: data.remarks,
        ...(data.sub_batches !== undefined
            ? data.sub_batches.length
                ? {
                    sub_batches: { set: data.sub_batches.map((sb) => ({ id: sb.id })) },
                }
                : { sub_batches: { set: [] } } // clear all if empty
            : {}),
        ...(data.workers !== undefined
            ? data.workers.length
                ? {
                    dept_workers: {
                        deleteMany: {}, // remove old links
                        create: data.workers.map((w) => ({
                            worker_id: w.id,
                            assigned_date: w.assignedDate
                                ? new Date(w.assignedDate)
                                : new Date(),
                        })),
                    },
                }
                : { dept_workers: { deleteMany: {} } } // clear all if empty
            : {}),
        ...(data.supervisorId
            ? { supervisor: { connect: { id: data.supervisorId } } }
            : {}), // connect supervisor if ID provided
    };
    return await db_1.default.departments.update({
        where: { id },
        data: updateData,
        include: departmentInclude,
    });
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (id) => {
    return await db_1.default.departments.delete({
        where: { id },
        include: departmentInclude,
    });
};
exports.deleteDepartment = deleteDepartment;
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
            worker_logs: {
                include: {
                    worker: true, // ✅ Include worker who performed the work
                },
                orderBy: {
                    work_date: 'desc', // Most recent logs first
                },
            },
        },
    });
    // Step 3: Return in Kanban style
    return {
        newArrival: subs.filter((s) => s.stage === "NEW_ARRIVAL"),
        inProgress: subs.filter((s) => s.stage === "IN_PROGRESS"),
        completed: subs.filter((s) => s.stage === "COMPLETED"),
    };
}
// Remove worker from department
const removeWorkerFromDepartment = async (departmentId, workerId) => {
    // Delete the link from department_workers
    return await db_1.default.department_workers.deleteMany({
        where: {
            department_id: departmentId,
            worker_id: workerId,
        },
    });
};
exports.removeWorkerFromDepartment = removeWorkerFromDepartment;
// Get All the Sub-batches that are sent to production
const getProductionSubBatches = async (productionDeptId) => {
    return await db_1.default.department_sub_batches.findMany({
        where: {
            department_id: productionDeptId,
        },
        include: {
            sub_batch: {
                include: {
                    size_details: true,
                    attachments: true,
                    batch: true,
                },
            },
            department: true,
        },
    });
};
exports.getProductionSubBatches = getProductionSubBatches;
