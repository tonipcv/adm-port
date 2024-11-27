import { subscriptionQueue } from './queue';

export async function scheduleSubscriptionDowngrade(userId: string, endDate: Date) {
  const now = new Date();
  const delay = endDate.getTime() - now.getTime();

  if (delay > 0) {
    // Agenda o job para executar no momento exato
    await subscriptionQueue.add(
      { userId },
      { 
        delay,
        attempts: 3, // Número de tentativas em caso de falha
        backoff: {
          type: 'exponential',
          delay: 1000 // Delay inicial entre tentativas
        },
        removeOnComplete: true, // Remove o job após completar com sucesso
        removeOnFail: false // Mantém jobs falhos para investigação
      }
    );

    console.log(`Scheduled downgrade for user ${userId} at ${endDate}`);
  }
} 