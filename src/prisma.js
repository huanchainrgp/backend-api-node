import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function ensurePrisma() {
  // Touch the connection
  await prisma.$queryRaw`select 1`;
}


