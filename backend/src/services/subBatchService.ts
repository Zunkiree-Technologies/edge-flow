import prisma from "../config/db";

interface SubBatchData {
  roll_id?: number;
  batch_id?: number;
  estimated_pieces: number;
  expected_items: number;
  start_date: Date | string;
  due_date: Date | string;
  department_id?: number;
}

export const createSubBatch = async (data: SubBatchData) => {
  return await prisma.sub_batches.create({
    data: {
      estimated_pieces: data.estimated_pieces,
      expected_items: data.expected_items,
      start_date: new Date(data.start_date),
      due_date: new Date(data.due_date),
      ...(data.roll_id && { roll_id: data.roll_id }),
      ...(data.batch_id && { batch_id: data.batch_id }),
      ...(data.department_id && { department_id: data.department_id }),
    },
  });
};

export const getAllSubBatches = async () => {
  return await prisma.sub_batches.findMany({
    include: {
      roll: true,
      batch: true,
      department: true,
    },
  });
};

export const getSubBatchById = async (id: number) => {
  const subBatch = await prisma.sub_batches.findUnique({
    where: { id },
    include: { roll: true, batch: true, department: true },
  });
  if (!subBatch) throw new Error("Sub-batch not found");
  return subBatch;
};

export const updateSubBatch = async (
  id: number,
  data: Partial<SubBatchData>
) => {
  const updateData: any = { ...data };
  return await prisma.sub_batches.update({
    where: { id },
    data: {
      ...updateData,
      ...(data.roll_id && { roll_id: data.roll_id }),
      ...(data.batch_id && { batch_id: data.batch_id }),
      ...(data.department_id && { department_id: data.department_id }),
    },
  });
};

export const deleteSubBatch = async (id: number) => {
  return await prisma.sub_batches.delete({ where: { id } });
};
