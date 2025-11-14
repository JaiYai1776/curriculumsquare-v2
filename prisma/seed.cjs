// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const vendor = await prisma.vendor.upsert({
    where: { slug: 'tried-and-true' },
    update: {},
    create: {
      name: 'Tried and True',
      slug: 'tried-and-true',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'pre-american-revolution-activities' },
    update: {},
    create: {
      title: 'Pre-American Revolution Activities',
      slug: 'pre-american-revolution-activities',
      priceCents: 2900,
      vendorId: vendor.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'world-war-ii-simulation' },
    update: {},
    create: {
      title: 'World War II Simulation',
      slug: 'world-war-ii-simulation',
      priceCents: 4900,
      vendorId: vendor.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
