import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWorkers() {
  console.log('=== Fixing Worker Assignments ===\n');

  // Find departments
  const depX = await prisma.departments.findFirst({ where: { name: { contains: 'Dep-X' } } });
  const depY = await prisma.departments.findFirst({ where: { name: { contains: 'Dep-Y' } } });
  const depZ = await prisma.departments.findFirst({ where: { name: { contains: 'Dep-Z' } } });

  console.log('Dep-X ID:', depX?.id);
  console.log('Dep-Y ID:', depY?.id);
  console.log('Dep-Z ID:', depZ?.id, '\n');

  if (!depX || !depY || !depZ) {
    console.log('❌ One or more departments not found!');
    return;
  }

  // Assign RT-X-W1 and RT-X-W2 to Dep-X
  console.log('Assigning RT-X-W1 and RT-X-W2 to Dep-X...');
  await prisma.workers.updateMany({
    where: { name: { in: ['RT-X-W1', 'RT-X-W2'] } },
    data: { department_id: depX.id }
  });

  // Assign RT-Y-W1 and RT-Y-W2 to Dep-Y
  console.log('Assigning RT-Y-W1 and RT-Y-W2 to Dep-Y...');
  await prisma.workers.updateMany({
    where: { name: { in: ['RT-Y-W1', 'RT-Y-W2'] } },
    data: { department_id: depY.id }
  });

  // Assign RT-Z-W1 and RT-Z-W2 to Dep-Z
  console.log('Assigning RT-Z-W1 and RT-Z-W2 to Dep-Z...');
  await prisma.workers.updateMany({
    where: { name: { in: ['RT-Z-W1', 'RT-Z-W2'] } },
    data: { department_id: depZ.id }
  });

  console.log('\n✅ Worker assignments updated!');

  // Verify
  const workersX = await prisma.workers.findMany({
    where: { department_id: depX.id },
    include: { department: true }
  });

  const workersY = await prisma.workers.findMany({
    where: { department_id: depY.id },
    include: { department: true }
  });

  const workersZ = await prisma.workers.findMany({
    where: { department_id: depZ.id },
    include: { department: true }
  });

  console.log('\n=== Verification ===');
  console.log(`Dep-X workers: ${workersX.length}`);
  workersX.forEach(w => console.log(`  - ${w.name}`));

  console.log(`\nDep-Y workers: ${workersY.length}`);
  workersY.forEach(w => console.log(`  - ${w.name}`));

  console.log(`\nDep-Z workers: ${workersZ.length}`);
  workersZ.forEach(w => console.log(`  - ${w.name}`));

  await prisma.$disconnect();
}

fixWorkers();
