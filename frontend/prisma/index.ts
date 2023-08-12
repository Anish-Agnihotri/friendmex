import { PrismaClient } from "@prisma/client";

// Setup global prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Export db
const db = globalForPrisma.prisma ?? new PrismaClient();
export default db;

// Assign to global (cache)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
