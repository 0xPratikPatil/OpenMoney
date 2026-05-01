import { prisma } from './index.js';

async function main() {
  console.log('Seeding database...');

  // Add sample data here as needed for development
  // const user = await prisma.user.create({ ... })

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
