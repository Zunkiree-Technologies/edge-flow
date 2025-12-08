/**
 * Production Database Cleanup Script
 *
 * This script cleans all demo data from the production database
 * while keeping only the admin@gmail.com user.
 *
 * Run with: npx ts-node cleanup_production.ts
 */

import { PrismaClient } from '@prisma/client';

// Production database URL
const PRODUCTION_DATABASE_URL = "postgresql://neondb_owner:npg_gIGe4vrTFCN1@ep-odd-sunset-a15pegww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

async function cleanupProductionDatabase() {
  console.log('🚀 Starting production database cleanup...\n');

  try {
    // Step 1: Delete sub_batch_rejected (depends on worker_logs, sub_batches, departments)
    console.log('1️⃣ Deleting sub_batch_rejected...');
    const rejectedDeleted = await prisma.sub_batch_rejected.deleteMany({});
    console.log(`   ✅ Deleted ${rejectedDeleted.count} rejected records\n`);

    // Step 2: Delete sub_batch_altered (depends on worker_logs, sub_batches, departments)
    console.log('2️⃣ Deleting sub_batch_altered...');
    const alteredDeleted = await prisma.sub_batch_altered.deleteMany({});
    console.log(`   ✅ Deleted ${alteredDeleted.count} altered records\n`);

    // Step 3: Delete worker_logs (depends on workers, sub_batches)
    console.log('3️⃣ Deleting worker_logs...');
    const workerLogsDeleted = await prisma.worker_logs.deleteMany({});
    console.log(`   ✅ Deleted ${workerLogsDeleted.count} worker logs\n`);

    // Step 4: Delete department_sub_batch_history
    console.log('4️⃣ Deleting department_sub_batch_history...');
    const historyDeleted = await prisma.department_sub_batch_history.deleteMany({});
    console.log(`   ✅ Deleted ${historyDeleted.count} history records\n`);

    // Step 5: Delete department_sub_batches (depends on departments, sub_batches)
    console.log('5️⃣ Deleting department_sub_batches...');
    const deptSubBatchesDeleted = await prisma.department_sub_batches.deleteMany({});
    console.log(`   ✅ Deleted ${deptSubBatchesDeleted.count} department sub-batches\n`);

    // Step 6: Delete sub_batch_workflow_steps
    console.log('6️⃣ Deleting sub_batch_workflow_steps...');
    const workflowStepsDeleted = await prisma.sub_batch_workflow_steps.deleteMany({});
    console.log(`   ✅ Deleted ${workflowStepsDeleted.count} workflow steps\n`);

    // Step 7: Delete sub_batch_workflows
    console.log('7️⃣ Deleting sub_batch_workflows...');
    const workflowsDeleted = await prisma.sub_batch_workflows.deleteMany({});
    console.log(`   ✅ Deleted ${workflowsDeleted.count} workflows\n`);

    // Step 8: Delete sub_batch_size_details
    console.log('8️⃣ Deleting sub_batch_size_details...');
    const sizeDetailsDeleted = await prisma.sub_batch_size_details.deleteMany({});
    console.log(`   ✅ Deleted ${sizeDetailsDeleted.count} size details\n`);

    // Step 9: Delete sub_batch_attachments
    console.log('9️⃣ Deleting sub_batch_attachments...');
    const attachmentsDeleted = await prisma.sub_batch_attachments.deleteMany({});
    console.log(`   ✅ Deleted ${attachmentsDeleted.count} attachments\n`);

    // Step 10: Delete sub_batches (depends on batches)
    console.log('🔟 Deleting sub_batches...');
    const subBatchesDeleted = await prisma.sub_batches.deleteMany({});
    console.log(`   ✅ Deleted ${subBatchesDeleted.count} sub-batches\n`);

    // Step 11: Delete batches (depends on rolls)
    console.log('1️⃣1️⃣ Deleting batches...');
    const batchesDeleted = await prisma.batches.deleteMany({});
    console.log(`   ✅ Deleted ${batchesDeleted.count} batches\n`);

    // Step 12: Delete rolls (depends on vendors)
    console.log('1️⃣2️⃣ Deleting rolls...');
    const rollsDeleted = await prisma.rolls.deleteMany({});
    console.log(`   ✅ Deleted ${rollsDeleted.count} rolls\n`);

    // Step 13: Delete department_workers
    console.log('1️⃣3️⃣ Deleting department_workers...');
    const deptWorkersDeleted = await prisma.department_workers.deleteMany({});
    console.log(`   ✅ Deleted ${deptWorkersDeleted.count} department workers\n`);

    // Step 14: Delete workers (depends on departments)
    console.log('1️⃣4️⃣ Deleting workers...');
    const workersDeleted = await prisma.workers.deleteMany({});
    console.log(`   ✅ Deleted ${workersDeleted.count} workers\n`);

    // Step 15: Delete workflow_steps (depends on departments, workflow_templates)
    console.log('1️⃣5️⃣ Deleting workflow_steps...');
    const wfStepsDeleted = await prisma.workflow_steps.deleteMany({});
    console.log(`   ✅ Deleted ${wfStepsDeleted.count} workflow template steps\n`);

    // Step 16: Delete workflow_templates
    console.log('1️⃣6️⃣ Deleting workflow_templates...');
    const templatesDeleted = await prisma.workflow_templates.deleteMany({});
    console.log(`   ✅ Deleted ${templatesDeleted.count} workflow templates\n`);

    // Step 17: Delete departments
    console.log('1️⃣7️⃣ Deleting departments...');
    const departmentsDeleted = await prisma.departments.deleteMany({});
    console.log(`   ✅ Deleted ${departmentsDeleted.count} departments\n`);

    // Step 18: Delete supervisors (users except admin)
    console.log('1️⃣8️⃣ Deleting supervisors (keeping admin@gmail.com)...');
    const supervisorsDeleted = await prisma.supervisor.deleteMany({
      where: {
        email: {
          not: 'admin@gmail.com'
        }
      }
    });
    console.log(`   ✅ Deleted ${supervisorsDeleted.count} supervisors\n`);

    // Step 19: Delete vendors
    console.log('1️⃣9️⃣ Deleting vendors...');
    const vendorsDeleted = await prisma.vendors.deleteMany({});
    console.log(`   ✅ Deleted ${vendorsDeleted.count} vendors\n`);

    // Step 20-25: Delete inventory and other tables (wrapped in try-catch for new tables)
    let invSubDeleted = { count: 0 };
    let invAddDeleted = { count: 0 };
    let inventoryDeleted = { count: 0 };
    let invCatDeleted = { count: 0 };
    let categoriesDeleted = { count: 0 };
    let clientsDeleted = { count: 0 };

    try {
      console.log('2️⃣0️⃣ Deleting inventory_subtraction...');
      invSubDeleted = await prisma.inventory_subtraction.deleteMany({});
      console.log(`   ✅ Deleted ${invSubDeleted.count} inventory subtractions\n`);
    } catch { console.log('   ⚠️ Table inventory_subtraction not found (skipped)\n'); }

    try {
      console.log('2️⃣1️⃣ Deleting inventory_addition...');
      invAddDeleted = await prisma.inventory_addition.deleteMany({});
      console.log(`   ✅ Deleted ${invAddDeleted.count} inventory additions\n`);
    } catch { console.log('   ⚠️ Table inventory_addition not found (skipped)\n'); }

    try {
      console.log('2️⃣2️⃣ Deleting inventory...');
      inventoryDeleted = await prisma.inventory.deleteMany({});
      console.log(`   ✅ Deleted ${inventoryDeleted.count} inventory items\n`);
    } catch { console.log('   ⚠️ Table inventory not found (skipped)\n'); }

    try {
      console.log('2️⃣3️⃣ Deleting inventory_category...');
      invCatDeleted = await prisma.inventory_category.deleteMany({});
      console.log(`   ✅ Deleted ${invCatDeleted.count} inventory categories\n`);
    } catch { console.log('   ⚠️ Table inventory_category not found (skipped)\n'); }

    try {
      console.log('2️⃣4️⃣ Deleting categories...');
      categoriesDeleted = await prisma.categories.deleteMany({});
      console.log(`   ✅ Deleted ${categoriesDeleted.count} categories\n`);
    } catch { console.log('   ⚠️ Table categories not found (skipped)\n'); }

    try {
      console.log('2️⃣5️⃣ Deleting clients...');
      clientsDeleted = await prisma.clients.deleteMany({});
      console.log(`   ✅ Deleted ${clientsDeleted.count} clients\n`);
    } catch { console.log('   ⚠️ Table clients not found (skipped)\n'); }

    // Verify admin user exists
    console.log('🔍 Verifying admin user...');
    const adminUser = await prisma.supervisor.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (adminUser) {
      console.log(`   ✅ Admin user exists: ${adminUser.email} (ID: ${adminUser.id})\n`);
    } else {
      console.log('   ⚠️ Admin user not found! You may need to create it.\n');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Production database cleanup complete!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   - Rejected records deleted: ${rejectedDeleted.count}`);
    console.log(`   - Altered records deleted: ${alteredDeleted.count}`);
    console.log(`   - Worker logs deleted: ${workerLogsDeleted.count}`);
    console.log(`   - History records deleted: ${historyDeleted.count}`);
    console.log(`   - Department sub-batches deleted: ${deptSubBatchesDeleted.count}`);
    console.log(`   - Workflow steps deleted: ${workflowStepsDeleted.count}`);
    console.log(`   - Workflows deleted: ${workflowsDeleted.count}`);
    console.log(`   - Size details deleted: ${sizeDetailsDeleted.count}`);
    console.log(`   - Attachments deleted: ${attachmentsDeleted.count}`);
    console.log(`   - Sub-batches deleted: ${subBatchesDeleted.count}`);
    console.log(`   - Batches deleted: ${batchesDeleted.count}`);
    console.log(`   - Rolls deleted: ${rollsDeleted.count}`);
    console.log(`   - Department workers deleted: ${deptWorkersDeleted.count}`);
    console.log(`   - Workers deleted: ${workersDeleted.count}`);
    console.log(`   - Workflow template steps deleted: ${wfStepsDeleted.count}`);
    console.log(`   - Workflow templates deleted: ${templatesDeleted.count}`);
    console.log(`   - Departments deleted: ${departmentsDeleted.count}`);
    console.log(`   - Supervisors deleted: ${supervisorsDeleted.count}`);
    console.log(`   - Vendors deleted: ${vendorsDeleted.count}`);
    console.log(`   - Inventory subtractions deleted: ${invSubDeleted.count}`);
    console.log(`   - Inventory additions deleted: ${invAddDeleted.count}`);
    console.log(`   - Inventory items deleted: ${inventoryDeleted.count}`);
    console.log(`   - Inventory categories deleted: ${invCatDeleted.count}`);
    console.log(`   - Categories deleted: ${categoriesDeleted.count}`);
    console.log(`   - Clients deleted: ${clientsDeleted.count}`);
    console.log('\n🔐 Kept: admin@gmail.com as the main admin\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupProductionDatabase()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
