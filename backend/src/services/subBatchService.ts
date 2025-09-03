// src/services/subBatchService.ts
import prisma from "../config/db";
import {
  SubBatchPayload,
  SubBatchPayloadWithArrays,
} from "../types/subBatchTypes";

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
