// src/config/db.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create a connection pool
const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

// Export the prisma instance as default
export default prisma;

// Export Prisma namespace for types
export { Prisma };

// Re-export commonly used model types for convenience
export type {
  workflow_steps,
  department_sub_batches,
  sub_batch_altered,
  sub_batch_rejected,
  departments,
  sub_batches,
  workers,
  department_sub_batch_history
} from "@prisma/client";

// Export enums if you have any
export { DepartmentStage } from "@prisma/client"; // if this exists in your schema
