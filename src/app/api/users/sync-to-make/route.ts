import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const WEBHOOK_URL = 'https://hook.us1.make.com/6jot75gvs0fsosf8p271631htmbbijxu';

export async function POST() {
  try {
    console.log('Starting sync with Make...');
    
    // Buscar todos os usuários existentes
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        whatsapp: true
      }
    });

    console.log(`Found ${users.length} users to sync`);
    console.log('Sample user data:', users[0]); // Mostra o primeiro usuário como exemplo

    // Enviar para o webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(users)
    });

    const responseText = await response.text();
    console.log('Make webhook response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to send data to webhook: ${responseText}`);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${users.length} users to Make`,
      timestamp: new Date().toISOString(),
      sampleData: users[0] // Incluir exemplo no retorno
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 