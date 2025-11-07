// src/services/departmentSubBatchService.ts
import prisma from "../config/db";

// Get all department_sub_batches entries for a specific sub-batch
// This shows all workflows (main, rejected, altered) for a sub-batch
export const getAllEntriesForSubBatch = async (subBatchId: number) => {
  const entries = await prisma.department_sub_batches.findMany({
    where: {
      sub_batch_id: subBatchId,
    },
    include: {
      department: true,
    },
    orderBy: [
      { is_current: 'desc' }, // Show active entries first
      { createdAt: 'desc' },
    ],
  });

  return entries;
};
