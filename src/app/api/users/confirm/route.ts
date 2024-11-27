import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }

  try {
    // Verificar o token e atualizar o status do usuário
    const user = await prisma.user.findFirst({
      where: {
        confirmationToken: token,
        status: 'pending'
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Atualizar o status do usuário para verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'verified',
        confirmationToken: null
      }
    });

    return NextResponse.json({
      message: 'Email confirmed successfully'
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm email' },
      { status: 500 }
    );
  }
} 