// src/services/subBatchService.ts
import prisma from "../config/db";
import {
  SubBatchPayload,
  SubBatchPayloadWithArrays,
} from "../types/subBatchTypes";
import { DepartmentStage } from "../config/constants";

// Create Sub-Batch
export const createSubBatch = async (data: SubBatchPayload) => {
  if (!data.name.trim()) throw { message: "Name is required" };
  if (data.estimatedPieces <= 0 || data.expectedItems <= 0)
    throw { message: "Estimated and expected items must be positive" };
  if (new Date(data.startDate) > new Date(data.dueDate))
    throw { message: "Start date cannot be after due date" };

  const createData: any = {
    name: data.name,
    estimated_pieces: data.estimatedPieces,
    expected_items: data.expectedItems,
    start_date: new Date(data.startDate),
    due_date: new Date(data.dueDate),
    roll_id: data.rollId,
    batch_id: data.batchId,
    department_id: data.departmentId,
    ...(data.sizeDetails?.length
      ? {
          size_details: {
            create: data.sizeDetails.map((sd) => ({
              category: sd.category,
              pieces: sd.pieces,
            })),
          },
        }
      : {}),
    ...(data.attachments?.length
      ? {
          attachments: {
            create: data.attachments.map((a) => ({
              attachment_name: a.attachmentName,
              quantity: a.quantity,
            })),
          },
        }
      : {}),
  };

  const subBatch = await prisma.sub_batches.create({
    data: createData,
    include: { size_details: true, attachments: true },
  });

  return { message: "Sub-batch created successfully", subBatch };
};

// Get all Sub-Batches
export const getAllSubBatches = async () => {
  return await prisma.sub_batches.findMany({
    include: { size_details: true, attachments: true },
  });
};

// Get Sub-Batch by ID
export const getSubBatchById = async (id: number) => {
  const subBatch = await prisma.sub_batches.findUnique({
    where: { id },
    include: { size_details: true, attachments: true },
  });
  if (!subBatch) throw { message: "Sub-batch not found" };
  return subBatch;
};

// Update Sub-Batch
export const updateSubBatch = async (
  id: number,
  data: Partial<SubBatchPayloadWithArrays>
) => {
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.estimatedPieces !== undefined)
    updateData.estimated_pieces = data.estimatedPieces;
  if (data.expectedItems !== undefined)
    updateData.expected_items = data.expectedItems;
  if (data.startDate !== undefined)
    updateData.start_date = new Date(data.startDate);
  if (data.dueDate !== undefined) updateData.due_date = new Date(data.dueDate);
  if (data.rollId !== undefined) updateData.roll_id = data.rollId;
  if (data.batchId !== undefined) updateData.batch_id = data.batchId;
  if (data.departmentId !== undefined)
    updateData.department_id = data.departmentId;

  const childOps: any = {};

  if (data.sizeDetails !== undefined) {
    childOps.size_details = data.sizeDetails.length
      ? {
          deleteMany: {},
          create: data.sizeDetails.map((sd) => ({
            category: sd.category,
            pieces: sd.pieces,
          })),
        }
      : { deleteMany: {} };
  }

  if (data.attachments !== undefined) {
    childOps.attachments = data.attachments.length
      ? {
          deleteMany: {},
          create: data.attachments.map((a) => ({
            attachment_name: a.attachmentName,
            quantity: a.quantity,
          })),
        }
      : { deleteMany: {} };
  }

  const subBatch = await prisma.sub_batches.update({
    where: { id },
    data: { ...updateData, ...childOps },
    include: { size_details: true, attachments: true },
  });

  return { message: "Sub-batch updated successfully", subBatch };
};

// Delete Sub-Batch
export const deleteSubBatch = async (id: number) => {
  const deleted = await prisma.sub_batches.delete({
    where: { id },
    include: { size_details: true, attachments: true },
  });
  return { message: "Sub-batch deleted successfully", subBatch: deleted };
};



// Send Sub-Batch to Production 
export async function sendToProduction(
  subBatchId: number,
  workflowTemplateId: number
) {
  // 1️⃣ Get workflow template steps
  const templateSteps = await prisma.workflow_steps.findMany({
    where: { workflow_template_id: workflowTemplateId },
    orderBy: { step_index: "asc" },
  });

  if (!templateSteps.length) throw new Error("Workflow template has no steps");

  // 2️⃣ Create sub-batch workflow
  const workflow = await prisma.sub_batch_workflows.create({
    data: {
      sub_batch_id: subBatchId,
      current_step_index: 0,
      steps: {
        create: templateSteps.map((step) => ({
          step_index: step.step_index,
          department_id: step.department_id,
        })),
      },
    },
    include: { steps: true },
  });

  // 3️⃣ Send to first department in New Arrival
  const firstDeptId = workflow.steps[0].department_id;
  await prisma.department_sub_batches.create({
    data: {
      sub_batch_id: subBatchId,
      department_id: firstDeptId,
      stage: DepartmentStage.NEW_ARRIVAL,
      is_current: true,
    },
  });

  return workflow;
}


export async function moveSubBatchStage(
  departmentSubBatchId: number,
  toStage: DepartmentStage
) {
  // 1️⃣ Get current record
  const dsb = await prisma.department_sub_batches.findUnique({
    where: { id: departmentSubBatchId },
  });

  if (!dsb) throw new Error("Department sub-batch not found");

  const fromStage = dsb.stage;

  // 2️⃣ Update stage
  const updatedDSB = await prisma.department_sub_batches.update({
    where: { id: departmentSubBatchId },
    data: { stage: toStage },
  });

  // 3️⃣ Log history
  await prisma.department_sub_batch_history.create({
    data: {
      department_sub_batch_id: departmentSubBatchId,
      sub_batch_id: dsb.sub_batch_id!,
      from_stage: fromStage,
      to_stage: toStage,
    },
  });

  return updatedDSB;
}


export async function advanceSubBatchToNextDepartment(subBatchId: number) {
  // 1️⃣ Get workflow with steps
  const workflow = await prisma.sub_batch_workflows.findUnique({
    where: { sub_batch_id: subBatchId },
    include: { steps: true },
  });

  if (!workflow) throw new Error("Workflow not found");

  let currentIndex = workflow.current_step_index;

  if (currentIndex + 1 >= workflow.steps.length) {
    return null; // Already at last department
  }

  const currentStep = workflow.steps[currentIndex];

  // 2️⃣ Mark current department_sub_batch as inactive
  await prisma.department_sub_batches.updateMany({
    where: {
      sub_batch_id: subBatchId,
      department_id: currentStep.department_id,
      is_current: true,
    },
    data: { is_current: false },
  });

  // 3️⃣ Advance workflow
  currentIndex += 1;
  await prisma.sub_batch_workflows.update({
    where: { sub_batch_id: subBatchId },
    data: { current_step_index: currentIndex },
  });

  const nextStep = workflow.steps[currentIndex];

  // 4️⃣ Add sub-batch to next department (New Arrival)
  return await prisma.department_sub_batches.create({
    data: {
      sub_batch_id: subBatchId,
      department_id: nextStep.department_id,
      stage: DepartmentStage.NEW_ARRIVAL,
      is_current: true,
    },
  });
}
