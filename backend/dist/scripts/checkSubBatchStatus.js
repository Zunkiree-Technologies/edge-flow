"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkStatus() {
    console.log('🔍 Checking sub-batch statuses...\n');
    try {
        const subBatches = await prisma.sub_batches.findMany({
            select: {
                id: true,
                name: true,
                status: true,
                dept_links: {
                    select: {
                        id: true,
                        department_id: true
                    }
                }
            }
        });
        console.log(`Found ${subBatches.length} sub-batches:\n`);
        subBatches.forEach(sb => {
            console.log(`Sub-batch #${sb.id}: ${sb.name}`);
            console.log(`  Status: ${sb.status}`);
            console.log(`  Dept entries: ${sb.dept_links.length}`);
            console.log('');
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkStatus();
