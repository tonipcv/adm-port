import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  try {
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
          email: true,
          createdAt: true,
          portfolios: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              id: true,
              name: true,
              createdAt: true,
              totalValue: true,
              totalProfit: true
            }
          }
        }
      })
    ]);

    return {
      stats: [
        { 
          name: 'Total Users', 
          value: totalUsers?.toLocaleString() ?? '0',
          change: '+12.5%'
        },
        { 
          name: 'Active Portfolios', 
          value: totalPortfolios?.toLocaleString() ?? '0',
          change: '+5.2%'
        },
        { 
          name: 'Total Cryptos Tracked', 
          value: totalCryptos?.toLocaleString() ?? '0',
          change: '+8.1%'
        },
        { 
          name: 'Premium Users', 
          value: premiumUsers?.toLocaleString() ?? '0',
          change: '+15.3%'
        }
      ],
      recentActivities: (recentActivities ?? []).map(user => {
        if (!user) return null;
        
        const lastPortfolio = user.portfolios?.[0];
        const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
        
        return {
          id: user.id,
          type: lastPortfolio ? 'Portfolio Update' : 'New User',
          description: lastPortfolio 
            ? `${user.name || 'User'} created portfolio "${lastPortfolio.name}"`
            : `${user.name || 'User'} joined the platform`,
          time: formatTimeAgo(createdAt),
          portfolioDetails: lastPortfolio ? {
            id: lastPortfolio.id,
            name: lastPortfolio.name,
            totalValue: lastPortfolio.totalValue ?? 0,
            totalProfit: lastPortfolio.totalProfit ?? 0
          } : null
        };
      }).filter(Boolean) // Remove itens nulos
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      stats: [],
      recentActivities: []
    };
  }
}

function formatTimeAgo(date: Date): string {
  try {
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
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'recently';
  }
} 