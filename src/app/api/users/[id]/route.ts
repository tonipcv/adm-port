import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scheduleSubscriptionDowngrade } from '@/lib/subscription';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extrair o ID da URL
    const segments = request.nextUrl.pathname.split('/');
    const userId = segments[segments.length - 1];

    const { 
      name, 
      email, 
      subscriptionStatus, 
      subscriptionEndDate,
      autoDowngradeToFree
    } = await request.json();

    // Verificar se o usuário existe
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        subscriptionStatus,
        subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : undefined,
      }
    });

    if (autoDowngradeToFree && subscriptionEndDate) {
      await scheduleSubscriptionDowngrade(userId, new Date(subscriptionEndDate));
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extrair o ID da URL
    const segments = request.nextUrl.pathname.split('/');
    const userId = segments[segments.length - 1];

    // Verificar se o usuário existe
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Error deleting user' },
      { status: 500 }
    );
  }
} 