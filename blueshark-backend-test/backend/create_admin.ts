/**
 * Create Admin User Script
 *
 * This script creates the admin@gmail.com user in the production database.
 *
 * Run with: npx ts-node create_admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Production database URL
const PRODUCTION_DATABASE_URL = "postgresql://neondb_owner:npg_gIGe4vrTFCN1@ep-odd-sunset-a15pegww-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

async function createAdminUser() {
  console.log('🚀 Creating admin user...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.supervisor.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Create admin user
    const admin = await prisma.supervisor.create({
      data: {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'ADMIN',
        departmentId: null
      }
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}\n`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
