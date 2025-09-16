// src/services/subBatchService.ts
import prisma from "../config/db";
import { Prisma } from "../generated/prisma";
import {
  SubBatchPayload,
  SubBatchPayloadWithArrays,
} from "../types/subBatchTypes";

export enum DepartmentStage {
  NEW_ARRIVAL = "NEW_ARRIVAL",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

// -----------------------------
// Create Sub-Batch
// -----------------------------
export const createSubBatch = async (data: SubBatchPayload) => {
  if (!data.name.trim()) throw { message: "Name is required" };
  if (data.estimatedPieces <= 0 || data.expectedItems <= 0)
    throw { message: "Estimated and expected items must be positive" };
  if (new Date(data.startDate) > new Date(data.dueDate))
    throw { message: "Start date cannot be after due date" };

  const subBatch = await prisma.sub_batches.create({
    data: {
      name: data.name,
      estimated_pieces: data.estimatedPieces,
      expected_items: data.expectedItems,
      start_date: new Date(data.startDate),
      due_date: new Date(data.dueDate),
      roll_id: data.rollId,
      batch_id: data.batchId,
      department_id: data.departmentId,
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
    },
  });

  if (data.sizeDetails?.length) {
    for (const sd of data.sizeDetails) {
      await prisma.sub_batch_size_details.create({
        data: {
          sub_batch_id: subBatch.id,
          category: sd.category,
          pieces: sd.pieces,
        },
      });
    }
  }

  return { message: "Sub-batch created successfully", subBatch };
};

// -----------------------------
// Get All / By ID
// -----------------------------
export const getAllSubBatches = async () => {
  return await prisma.sub_batches.findMany({
    include: { size_details: true, attachments: true },
  });
};

export const getSubBatchById = async (id: number) => {
  const subBatch = await prisma.sub_batches.findUnique({
    where: { id },
    include: { size_details: true, attachments: true },
  });
  if (!subBatch) throw { message: "Sub-batch not found" };
  return subBatch;
};

// -----------------------------
// Update Sub-Batch
// -----------------------------
export const updateSubBatch = async (
  id: number,
  data: Partial<SubBatchPayloadWithArrays>
) => {
  const updateData: Partial<SubBatchPayloadWithArrays> & any = {};

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

  const subBatch = await prisma.sub_batches.update({
    where: { id },
    data: updateData,
    include: { attachments: true },
  });

  if (data.sizeDetails !== undefined) {
    await prisma.sub_batch_size_details.deleteMany({
      where: { sub_batch_id: id },
    });

    for (const sd of data.sizeDetails) {
      await prisma.sub_batch_size_details.create({
        data: {
          sub_batch_id: id,
          category: sd.category,
          pieces: sd.pieces,
        },
      });
    }
  }

  if (data.attachments !== undefined) {
    await prisma.sub_batch_attachments.deleteMany({
      where: { sub_batch_id: id },
    });

    if (data.attachments.length) {
      for (const a of data.attachments) {
        await prisma.sub_batch_attachments.create({
          data: {
            sub_batch_id: id,
            attachment_name: a.attachmentName,
            quantity: a.quantity,
          },
        });
      }
    }
  }

  return { message: "Sub-batch updated successfully", subBatch };
};

// -----------------------------
// Delete Sub-Batch
// -----------------------------
export const deleteSubBatch = async (id: number) => {
  const deleted = await prisma.sub_batches.delete({
    where: { id },
    include: { size_details: true, attachments: true },
  });
  return { message: "Sub-batch deleted successfully", subBatch: deleted };
};

// -----------------------------
// Send Sub-Batch to Production
// -----------------------------
interface RejectedOrAlteredPiece {
  quantity: number;
  targetDepartmentId: number;
  reason: string;
}

export async function sendToProduction(
  subBatchId: number,
  workflowTemplateId?: number,
  manualDepartments?: number[],
  rejectedPieces?: RejectedOrAlteredPiece[],
  alteredPieces?: RejectedOrAlteredPiece[]
) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let steps: { step_index: number; department_id: number }[];

    if (workflowTemplateId) {
      const templateSteps = await tx.workflow_steps.findMany({
        where: { workflow_template_id: workflowTemplateId },
        orderBy: { step_index: "asc" },
      });
      if (!templateSteps.length)
        throw new Error("Workflow template has no steps");

      steps = templateSteps.map(
        (step: { step_index: number; department_id: number }) => ({
          step_index: step.step_index,
          department_id: step.department_id,
        })
      );
    } else if (manualDepartments && manualDepartments.length > 0) {
      steps = manualDepartments.map((deptId, index) => ({
        step_index: index,
        department_id: deptId,
      }));
    } else {
      throw new Error(
        "Workflow must be provided either by template or manual departments"
      );
    }

    const workflow = await tx.sub_batch_workflows.upsert({
      where: { sub_batch_id: subBatchId },
      update: {},
      create: {
        sub_batch_id: subBatchId,
        current_step_index: 0,
        steps: { create: steps },
      },
      include: { steps: true },
    });

    const firstDeptId = workflow.steps[0].department_id;

    const subBatch = await tx.sub_batches.findUnique({
      where: { id: subBatchId },
    });

    const firstDeptSubBatch = await tx.department_sub_batches.create({
      data: {
        sub_batch_id: subBatchId,
        department_id: firstDeptId,
        stage: DepartmentStage.NEW_ARRIVAL,
        is_current: true,
        quantity_remaining: subBatch?.expected_items || 0,
      },
    });

    // Handle rejected pieces
    if (rejectedPieces?.length) {
      for (const rejected of rejectedPieces) {
        await tx.sub_batch_rejected.create({
          data: {
            sub_batch_id: subBatchId,
            quantity: rejected.quantity,
            sent_to_department_id: rejected.targetDepartmentId,
            reason: rejected.reason,
          },
        });

        await tx.department_sub_batches.updateMany({
          where: {
            sub_batch_id: subBatchId,
            department_id: firstDeptId,
            is_current: true,
          },
          data: { quantity_remaining: { decrement: rejected.quantity } },
        });

        const deptSubBatch = await tx.department_sub_batches.create({
          data: {
            sub_batch_id: subBatchId,
            department_id: rejected.targetDepartmentId,
            stage: DepartmentStage.NEW_ARRIVAL,
            is_current: true,
            quantity_remaining: rejected.quantity,
          },
        });

        await tx.department_sub_batch_history.create({
          data: {
            department_sub_batch_id: deptSubBatch.id,
            sub_batch_id: subBatchId,
            from_stage: null,
            to_stage: DepartmentStage.NEW_ARRIVAL,
            to_department_id: rejected.targetDepartmentId,
            reason: rejected.reason,
          },
        });
      }
    }

    // Handle altered pieces
    if (alteredPieces?.length) {
      for (const altered of alteredPieces) {
        await tx.sub_batch_altered.create({
          data: {
            sub_batch_id: subBatchId,
            quantity: altered.quantity,
            sent_to_department_id: altered.targetDepartmentId,
            reason: altered.reason,
          },
        });

        await tx.department_sub_batches.updateMany({
          where: {
            sub_batch_id: subBatchId,
            department_id: firstDeptId,
            is_current: true,
          },
          data: { quantity_remaining: { decrement: altered.quantity } },
        });

        const deptSubBatch = await tx.department_sub_batches.create({
          data: {
            sub_batch_id: subBatchId,
            department_id: altered.targetDepartmentId,
            stage: DepartmentStage.NEW_ARRIVAL,
            is_current: true,
            quantity_remaining: altered.quantity,
          },
        });

        await tx.department_sub_batch_history.create({
          data: {
            department_sub_batch_id: deptSubBatch.id,
            sub_batch_id: subBatchId,
            from_stage: null,
            to_stage: DepartmentStage.NEW_ARRIVAL,
            to_department_id: altered.targetDepartmentId,
            reason: altered.reason,
          },
        });
      }
    }

    return { workflow, firstDeptSubBatch };
  });
}

// -----------------------------
// Move stage in Kanban
// -----------------------------
export async function moveSubBatchStage(
  departmentSubBatchId: number,
  toStage: DepartmentStage
) {
  const dsb = await prisma.department_sub_batches.findUnique({
    where: { id: departmentSubBatchId },
  });

  if (!dsb) throw new Error("Department sub-batch not found");

  const fromStage = dsb.stage;

  const updatedDSB = await prisma.department_sub_batches.update({
    where: { id: departmentSubBatchId },
    data: { stage: toStage },
  });

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

// -----------------------------
// Advance to next department
// -----------------------------
export async function advanceSubBatchToNextDepartment(subBatchId: number) {
  const workflow = await prisma.sub_batch_workflows.findUnique({
    where: { sub_batch_id: subBatchId },
    include: { steps: true },
  });

  if (!workflow) throw new Error("Workflow not found");

  let currentIndex = workflow.current_step_index;

  if (currentIndex + 1 >= workflow.steps.length) return null;

  const currentStep = workflow.steps[currentIndex];

  await prisma.department_sub_batches.updateMany({
    where: {
      sub_batch_id: subBatchId,
      department_id: currentStep.department_id,
      is_current: true,
    },
    data: { is_current: false },
  });

  currentIndex += 1;

  await prisma.sub_batch_workflows.update({
    where: { sub_batch_id: subBatchId },
    data: { current_step_index: currentIndex },
  });

  const nextStep = workflow.steps[currentIndex];

  return await prisma.department_sub_batches.create({
    data: {
      sub_batch_id: subBatchId,
      department_id: nextStep.department_id,
      stage: DepartmentStage.NEW_ARRIVAL,
      is_current: true,
    },
  });
}
