import { PrismaClient } from '@prisma/client';

// 防止開發環境中創建多個 PrismaClient 實例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;