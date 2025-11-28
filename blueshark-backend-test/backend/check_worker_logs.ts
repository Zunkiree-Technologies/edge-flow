import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  console.log('\n=== DEPARTMENT_SUB_BATCHES TABLE ===');
  const deptSubBatches = await prisma.department_sub_batches.findMany({
    where: { sub_batch_id: 10 },
    orderBy: { id: 'desc' }
  });

  console.log('Total department_sub_batches for sub_batch_id 10:', deptSubBatches.length);
  deptSubBatches.forEach(dsb => {
    console.log('\n--- Department Sub Batch ---');
    console.log('ID:', dsb.id);
    console.log('Sub Batch ID:', dsb.sub_batch_id);
    console.log('Department ID:', dsb.department_id);
    console.log('Quantity Remaining:', dsb.quantity_remaining);
    console.log('Quantity Assigned:', dsb.quantity_assigned);
  });

  console.log('\n=== WORKER_LOGS TABLE ===');
  const logs = await prisma.worker_logs.findMany({
    where: { sub_batch_id: 10 },
    orderBy: { id: 'desc' },
    take: 5
  });

  console.log('Total worker_logs for sub_batch_id 10:', logs.length);
  logs.forEach(log => {
    console.log('\n--- Worker Log ---');
    console.log('ID:', log.id);
    console.log('Worker ID:', log.worker_id);
    console.log('Sub Batch ID:', log.sub_batch_id);
    console.log('Department Sub Batch ID:', log.department_sub_batch_id);
    console.log('Quantity:', log.quantity_worked);
  });

  await prisma.$disconnect();
})();
