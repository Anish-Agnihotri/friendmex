import { PrismaClient } from "@prisma/client";

// Initialize and export db handler
const db = new PrismaClient();
export default db;
