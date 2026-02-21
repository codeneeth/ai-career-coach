import { db } from './lib/prisma.js';

async function testUser() {
  const user = await db.user.create({
    data: {
      clerkUserId: 'test123',
      email: 'test@example.com',
      name: 'Test User'
    },
  });
  console.log('Created user:', user);

  const foundUser = await db.user.findUnique({
    where: { clerkUserId: 'test123' },
  });
  console.log('Found user:', foundUser);
}

testUser()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await db.$disconnect();
  });