import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { navn: 'Admin Bruker', epost: 'admin@demo.no', rolle: 'ADMIN' },
      { navn: 'Instruktør Ivar', epost: 'ivar@demo.no', rolle: 'INSTRUKTOR' },
      { navn: 'Elev Eva', epost: 'eva@demo.no', rolle: 'ELEV' },
    ]
  });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 