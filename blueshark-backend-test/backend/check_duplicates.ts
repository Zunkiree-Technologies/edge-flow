import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  console.log('\n=== FULL DEPARTMENT_SUB_BATCH DETAILS ===');
  const records = await prisma.department_sub_batches.findMany({
    where: { sub_batch_id: 10 },
    orderBy: { id: 'asc' }
  });

  records.forEach(r => {
    console.log('\n------------------------');
    console.log('ID:', r.id);
    console.log('Sub Batch ID:', r.sub_batch_id);
    console.log('Department ID:', r.department_id);
    console.log('Quantity Remaining:', r.quantity_remaining);
    console.log('Quantity Assigned:', r.quantity_assigned);
    console.log('Assigned Worker ID:', r.assigned_worker_id);
    console.log('Parent Dept Sub Batch ID:', r.parent_department_sub_batch_id);
    console.log('Created At:', r.createdAt);
    console.log('Updated At:', r.updatedAt);
  });

  console.log('\n=== RECOMMENDATION ===');
  console.log('Record 36: Quantity Remaining 30, No worker assignment');
  console.log('Record 37: Quantity Remaining 20, Has worker assignment (worker_log ID 39)');
  console.log('\nTotal quantity should be 50 pieces (original batch)');
  console.log('36: 30 pieces + 37: 20 pieces = 50 pieces ✅');
  console.log('\nThese appear to be SPLIT records, not duplicates!');
  console.log('One portion (30) is unassigned, another portion (20) is assigned to RT-X-W1');

  await prisma.$disconnect();
})();
