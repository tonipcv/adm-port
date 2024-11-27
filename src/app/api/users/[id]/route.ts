import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { scheduleSubscriptionDowngrade } from '@/lib/subscription';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;

  try {
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      subscriptionStatus, 
      subscriptionEndDate,
      autoDowngradeToFree
    } = body;

    // Atualiza o usuário
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        subscriptionStatus,
        subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : null,
      }
    });

    // Se autoDowngradeToFree for true e houver uma data de término
    if (autoDowngradeToFree && subscriptionEndDate) {
      await scheduleSubscriptionDowngrade(user.id, new Date(subscriptionEndDate));
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 