import { NextResponse } from 'next/server';
import { bullBoardAdapter } from '@/lib/queue';

export async function GET(request: Request) {
  try {
    // Aqui você deve adicionar autenticação/autorização
    return bullBoardAdapter.getRouter()(request);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to access queue dashboard' }, { status: 500 });
  }
} 