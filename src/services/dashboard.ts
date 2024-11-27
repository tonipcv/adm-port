import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  const [
    totalUsers,
    totalPortfolios,
    totalCryptos,
    premiumUsers,
    recentActivities
  ] = await Promise.all([
    prisma.user.count(),
    prisma.portfolio.count(),
    prisma.crypto.count(),
    prisma.user.count({
      where: {
        subscriptionStatus: 'premium'
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        portfolios: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            name: true,
            createdAt: true
          }
        }
      }
    })
  ]);

  return {
    stats: [
      { 
        name: 'Total Users', 
        value: totalUsers.toLocaleString(),
        change: '+12.5%' // Você pode calcular isso comparando com período anterior
      },
      { 
        name: 'Active Portfolios', 
        value: totalPortfolios.toLocaleString(),
        change: '+5.2%'
      },
      { 
        name: 'Total Cryptos Tracked', 
        value: totalCryptos.toLocaleString(),
        change: '+8.1%'
      },
      { 
        name: 'Premium Users', 
        value: premiumUsers.toLocaleString(),
        change: '+15.3%'
      }
    ],
    recentActivities: recentActivities.map(user => {
      const hasPortfolio = user.portfolios.length > 0;
      return {
        id: user.id,
        type: hasPortfolio ? 'Portfolio Update' : 'New User',
        description: hasPortfolio 
          ? `${user.name} created portfolio "${user.portfolios[0].name}"`
          : `${user.name} joined the platform`,
        time: formatTimeAgo(user.createdAt)
      };
    })
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
} 