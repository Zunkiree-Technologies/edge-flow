/**
 * Database Cleanup Script - Fix Worker Assignment Splitting Bug
 *
 * This script merges duplicate department_sub_batches records created by the splitting bug.
 *
 * What it does:
 * 1. Updates worker_logs to point to parent record (ID 36)
 * 2. Updates parent record with correct quantities
 * 3. Deletes duplicate child record (ID 37)
 *
 * Run this ONCE after deploying the code fix to workerLogService.ts
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupSplittingBug() {
  console.log('\n========================================');
  console.log('🔧 Database Cleanup - Splitting Bug Fix');
  console.log('========================================\n');

  try {
    // Step 0: Check current state
    console.log('Step 0: Checking current state...\n');

    const deptSubBatches = await prisma.department_sub_batches.findMany({
      where: { sub_batch_id: 10 },
      orderBy: { id: 'asc' },
    });

    console.log('Current department_sub_batches for RT-SB-1:');
    deptSubBatches.forEach(record => {
      console.log(`  ID: ${record.id}, Remaining: ${record.quantity_remaining}, Assigned: ${record.quantity_assigned || 0}, Parent: ${record.parent_department_sub_batch_id || 'null'}`);
    });

    const workerLogs = await prisma.worker_logs.findMany({
      where: { sub_batch_id: 10 },
      orderBy: { id: 'asc' },
    });

    console.log('\nCurrent worker_logs for RT-SB-1:');
    workerLogs.forEach(log => {
      console.log(`  ID: ${log.id}, Worker: ${log.worker_id}, Quantity: ${log.quantity_worked}, Dept Sub-Batch: ${log.department_sub_batch_id}`);
    });

    // Verify we have the expected duplicate structure
    if (deptSubBatches.length !== 2) {
      console.log(`\n⚠️  Expected 2 records, found ${deptSubBatches.length}`);
      console.log('Cleanup may have already been run or data structure is different.');
      console.log('Please verify manually before proceeding.\n');
      return;
    }

    const parentRecord = deptSubBatches.find(r => r.id === 36);
    const childRecord = deptSubBatches.find(r => r.id === 37);

    if (!parentRecord || !childRecord) {
      console.log('\n⚠️  Could not find expected parent (ID 36) or child (ID 37) records.');
      console.log('Cleanup may have already been run or data structure is different.\n');
      return;
    }

    console.log('\n✓ Found expected duplicate structure');

    // Execute cleanup in a transaction
    await prisma.$transaction(async (tx) => {
      // Step 1: Update worker_logs to point to parent
      console.log('\nStep 1: Updating worker_logs to point to parent record (ID 36)...');

      const updateResult = await tx.worker_logs.updateMany({
        where: { department_sub_batch_id: 37 },
        data: { department_sub_batch_id: 36 },
      });

      console.log(`✓ Updated ${updateResult.count} worker_log(s)`);

      // Step 2: Update parent record quantities
      console.log('\nStep 2: Updating parent record (ID 36) quantities...');

      await tx.department_sub_batches.update({
        where: { id: 36 },
        data: {
          quantity_assigned: 20,
          quantity_remaining: 30,
          remarks: 'Assigned',
        },
      });

      console.log('✓ Parent record updated:');
      console.log('  - quantity_assigned: 20');
      console.log('  - quantity_remaining: 30');

      // Step 3: Delete the duplicate child record
      console.log('\nStep 3: Deleting duplicate child record (ID 37)...');

      await tx.department_sub_batches.delete({
        where: { id: 37 },
      });

      console.log('✓ Child record deleted');
    });

    // Step 4: Verify cleanup
    console.log('\n========================================');
    console.log('✅ Cleanup Complete! Verifying...');
    console.log('========================================\n');

    const finalDeptSubBatches = await prisma.department_sub_batches.findMany({
      where: { sub_batch_id: 10 },
      orderBy: { id: 'asc' },
    });

    console.log('Final department_sub_batches for RT-SB-1:');
    finalDeptSubBatches.forEach(record => {
      console.log(`  ID: ${record.id}, Remaining: ${record.quantity_remaining}, Assigned: ${record.quantity_assigned || 0}, Parent: ${record.parent_department_sub_batch_id || 'null'}`);
    });

    const finalWorkerLogs = await prisma.worker_logs.findMany({
      where: { sub_batch_id: 10 },
      orderBy: { id: 'asc' },
    });

    console.log('\nFinal worker_logs for RT-SB-1:');
    finalWorkerLogs.forEach(log => {
      console.log(`  ID: ${log.id}, Worker: ${log.worker_id}, Quantity: ${log.quantity_worked}, Dept Sub-Batch: ${log.department_sub_batch_id}`);
    });

    if (finalDeptSubBatches.length === 1 && finalDeptSubBatches[0].id === 36) {
      console.log('\n✅ SUCCESS! Only ONE record remains (ID 36)');
      console.log('✅ Worker assignment linked correctly');
      console.log('\nNext steps:');
      console.log('1. Refresh the frontend browser');
      console.log('2. Verify ONE card appears for RT-SB-1 in Kanban');
      console.log('3. Click the card and verify worker assignment shows');
      console.log('4. Test assigning a second worker (RT-X-W2)');
    } else {
      console.log('\n⚠️  Unexpected result. Please verify manually.');
    }

  } catch (error) {
    console.error('\n❌ Error during cleanup:');
    console.error(error);
    console.log('\n⚠️  Database may be in inconsistent state. Please check manually.');
  } finally {
    await prisma.$disconnect();
    console.log('\n========================================\n');
  }
}

// Run the cleanup
cleanupSplittingBug()
  .catch(console.error);
