import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRTSB1() {
  console.log('=== RT-SB-1 Complete Data ===\n');

  // Find RT-SB-1
  const subBatch = await prisma.sub_batches.findFirst({
    where: { name: { contains: 'RT-SB-1' } }
  });

  if (!subBatch) {
    console.log('❌ RT-SB-1 not found!');
    await prisma.$disconnect();
    return;
  }

  console.log('📦 SUB-BATCH DETAILS:');
  console.log('  ID:', subBatch.id);
  console.log('  Name:', subBatch.name);
  console.log('  Status:', subBatch.status);
  console.log('  Estimated Pieces:', subBatch.estimated_pieces);
  console.log('  Expected Items:', subBatch.expected_items);
  console.log('  Start Date:', subBatch.start_date);
  console.log('  Due Date:', subBatch.due_date);
  console.log('  Batch ID:', subBatch.batch_id);
  console.log('  Roll ID:', subBatch.roll_id);
  console.log('  Department ID:', subBatch.department_id);

  // Get batch info
  if (subBatch.batch_id) {
    const batch = await prisma.batches.findUnique({
      where: { id: subBatch.batch_id }
    });

    console.log('\n📊 BATCH DETAILS:');
    console.log('  Batch ID:', batch?.id);
    console.log('  Batch Name:', batch?.name);
    console.log('  Quantity:', batch?.quantity);
    console.log('  Unit:', batch?.unit);
    console.log('  Color:', batch?.color);
    console.log('  Vendor ID:', batch?.vendor_id);
  }

  // Get roll info
  if (subBatch.roll_id) {
    const roll = await prisma.rolls.findUnique({
      where: { id: subBatch.roll_id }
    });

    console.log('\n🎞️ ROLL DETAILS:');
    console.log('  Roll ID:', roll?.id);
    console.log('  Roll Name:', roll?.name);
  }

  // Get department_sub_batches
  const deptSubBatches = await prisma.department_sub_batches.findMany({
    where: { sub_batch_id: subBatch.id },
    orderBy: { id: 'asc' }
  });

  console.log('\n🏭 DEPARTMENT SUB-BATCHES:');
  console.log('  Total entries:', deptSubBatches.length);

  for (const dsb of deptSubBatches) {
    const dept = dsb.department_id ? await prisma.departments.findUnique({
      where: { id: dsb.department_id }
    }) : null;

    console.log(`\n  Entry ${dsb.id}:`);
    console.log('    Department:', dept?.name, '(ID:', dept?.id + ')');
    console.log('    Stage:', dsb.stage);
    console.log('    Is Current:', dsb.is_current);
    console.log('    Quantity Received:', dsb.quantity_received);
    console.log('    Quantity Remaining:', dsb.quantity_remaining);
    console.log('    Remarks:', dsb.remarks || 'None');
  }

  // Check worker logs
  const workerLogs = await prisma.worker_logs.findMany({
    where: { sub_batch_id: subBatch.id }
  });

  console.log('\n👷 WORKER LOGS:');
  console.log('  Total logs:', workerLogs.length);

  if (workerLogs.length > 0) {
    for (const log of workerLogs) {
      const worker = await prisma.workers.findUnique({
        where: { id: log.worker_id }
      });
      const dept = log.department_id ? await prisma.departments.findUnique({
        where: { id: log.department_id }
      }) : null;

      console.log(`\n  Log ${log.id}:`);
      console.log('    Worker:', worker?.name);
      console.log('    Department:', dept?.name || 'N/A');
      console.log('    Quantity Worked:', log.quantity_worked);
      console.log('    Work Date:', log.work_date);
      console.log('    Unit Price:', log.unit_price);
      console.log('    Particulars:', log.particulars);
    }
  } else {
    console.log('  No worker logs yet');
  }

  await prisma.$disconnect();
}

checkRTSB1();
