import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWorkers() {
  console.log('=== Checking Workers for Dep-X ===\n');

  // Find Dep-X
  const depX = await prisma.departments.findFirst({
    where: { name: { contains: 'Dep-X' } }
  });

  console.log('Dep-X:', depX);
  console.log('Dep-X ID:', depX?.id, '\n');

  if (!depX) {
    console.log('❌ Dep-X not found!');
    return;
  }

  // Find workers assigned to Dep-X
  const workers = await prisma.workers.findMany({
    where: { department_id: depX.id },
    include: { department: true }
  });

  console.log('Workers assigned to Dep-X:', workers.length);
  console.log('Workers:', JSON.stringify(workers, null, 2));

  // Also check all workers
  const allWorkers = await prisma.workers.findMany({
    include: { department: true }
  });

  console.log('\n=== All Workers in Database ===');
  console.log('Total workers:', allWorkers.length);
  allWorkers.forEach(w => {
    console.log(`- ${w.name} (ID: ${w.id}, Dept ID: ${w.department_id}, Dept: ${w.department?.name || 'None'})`);
  });

  await prisma.$disconnect();
}

checkWorkers();
