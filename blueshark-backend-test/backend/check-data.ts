import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('\n=== CHECKING RT-SB-1 DATA ===\n');

  // Find RT-SB-1
  const subBatch = await prisma.sub_batches.findFirst({
    where: { name: { contains: 'RT-SB-1' } },
    include: {
      batch: true,
      roll: true,
    }
  });

  if (!subBatch) {
    console.log('❌ RT-SB-1 not found!');
    return;
  }

  console.log('✅ Found RT-SB-1:');
  console.log(`   ID: ${subBatch.id}`);
  console.log(`   Name: ${subBatch.name}`);
  console.log(`   Status: ${subBatch.status}`);
  console.log(`   Estimated Pieces: ${subBatch.estimated_pieces}`);
  console.log('');

  // Check department_sub_batches
  const deptSubBatches = await prisma.department_sub_batches.findMany({
    where: { sub_batch_id: subBatch.id },
    include: {
      department: true,
    },
    orderBy: { id: 'asc' }
  });

  console.log(`📊 Department Sub-Batches (${deptSubBatches.length} records):\n`);

  for (const dsb of deptSubBatches) {
    console.log(`   Dept: ${dsb.department?.name || 'Unknown'} (ID: ${dsb.department_id})`);
    console.log(`   is_current: ${dsb.is_current}`);
    console.log(`   quantity_received: ${dsb.quantity_received}`);
    console.log(`   quantity_remaining: ${dsb.quantity_remaining}`);
    console.log(`   stage: ${dsb.stage}`);
    console.log(`   remarks: ${dsb.remarks}`);
    console.log('');
  }

  // Check departments list
  console.log('🏢 All Departments:\n');
  const departments = await prisma.departments.findMany({
    orderBy: { id: 'asc' }
  });

  for (const dept of departments) {
    console.log(`   ${dept.id}: ${dept.name}`);
  }
  console.log('');

  await prisma.$disconnect();
}

checkData().catch(console.error);
