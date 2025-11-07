import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration Script: Fix existing sub-batches status
 *
 * This script updates all sub-batches that have entries in department_sub_batches
 * to have status = 'IN_PRODUCTION' instead of 'DRAFT'
 */
async function fixExistingSubBatches() {
  console.log('🔄 Starting migration to fix sub-batch statuses...\n');

  try {
    // Step 1: Find all sub_batch_ids that exist in department_sub_batches
    console.log('📊 Step 1: Finding sub-batches that are already in production...');
    const subBatchesInProduction = await prisma.department_sub_batches.findMany({
      select: {
        sub_batch_id: true
      },
      distinct: ['sub_batch_id'],
      where: {
        sub_batch_id: { not: null }
      }
    });

    const ids = subBatchesInProduction
      .map(d => d.sub_batch_id)
      .filter((id): id is number => id !== null);

    console.log(`   Found ${ids.length} sub-batches in production: ${ids.join(', ')}\n`);

    if (ids.length === 0) {
      console.log('✅ No sub-batches need status update.');
      return;
    }

    // Step 2: Check current status of these sub-batches
    console.log('📋 Step 2: Checking current status...');
    const subBatches = await prisma.sub_batches.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, status: true }
    });

    console.log('   Current statuses:');
    subBatches.forEach(sb => {
      console.log(`   - Sub-batch #${sb.id} (${sb.name}): ${sb.status}`);
    });
    console.log('');

    // Step 3: Update all these sub-batches to IN_PRODUCTION status
    console.log('🔄 Step 3: Updating statuses to IN_PRODUCTION...');
    const result = await prisma.sub_batches.updateMany({
      where: {
        id: { in: ids },
        status: 'DRAFT'  // Only update if currently DRAFT
      },
      data: {
        status: 'IN_PRODUCTION'
      }
    });

    console.log(`   Updated ${result.count} sub-batches\n`);

    // Step 4: Verify the changes
    console.log('✅ Step 4: Verifying changes...');
    const updatedSubBatches = await prisma.sub_batches.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, status: true }
    });

    console.log('   New statuses:');
    updatedSubBatches.forEach(sb => {
      console.log(`   - Sub-batch #${sb.id} (${sb.name}): ${sb.status} ✅`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log(`   Total sub-batches updated: ${result.count}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixExistingSubBatches()
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
