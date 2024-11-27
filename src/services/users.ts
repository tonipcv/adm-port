import prisma from '@/lib/prisma';

export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionStatus: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          portfolios: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users.map(user => ({
    id: user.id,
    name: user.name || 'Anonymous',
    email: user.email || 'No email',
    status: user.emailVerified ? 'verified' : 'pending',
    plan: user.subscriptionStatus || 'free',
    portfoliosCount: user._count.portfolios
  }));
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id }
  });
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  subscriptionStatus?: string;
}) {
  return await prisma.user.update({
    where: { id },
    data
  });
} 