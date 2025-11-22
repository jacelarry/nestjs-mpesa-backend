import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.bundle.upsert({
    where: { id: 1 },
    update: {},
    create: { name: '20bob bundle', price: 20, code: '*123*1#' }
  });
  await prisma.bundle.upsert({
    where: { id: 2 },
    update: {},
    create: { name: '50bob bundle', price: 50, code: '*123*2#' }
  });
  console.log('Seed complete');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
