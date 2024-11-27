import Bull from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

// Configuração do Redis
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Cria a fila de downgrade
export const subscriptionQueue = new Bull('subscription-downgrades', REDIS_URL);

// Configuração do Bull Board (painel de administração)
const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(subscriptionQueue)],
  serverAdapter,
});

// Processa os jobs de downgrade
subscriptionQueue.process(async (job) => {
  const { userId } = job.data;
  
  try {
    const prisma = (await import('@/lib/prisma')).default;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'free',
        subscriptionEndDate: null,
      },
    });

    console.log(`Successfully downgraded user ${userId} to free plan`);
  } catch (error) {
    console.error(`Failed to downgrade user ${userId}:`, error);
    throw error; // Permite que o Bull tente novamente
  }
});

export { serverAdapter as bullBoardAdapter }; 