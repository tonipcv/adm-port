import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { scheduleSubscriptionDowngrade } from '@/lib/subscription';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
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

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email || 'No email',
      status: user.emailVerified ? 'verified' : 'pending',
      plan: user.subscriptionStatus || 'free',
      subscriptionEndDate: user.subscriptionEndDate?.toISOString() || null,
      portfoliosCount: user._count.portfolios
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      subscriptionStatus, 
      subscriptionEndDate,
      autoDowngradeToFree
    } = body;

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscriptionStatus,
        subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : null,
        // Se autoDowngradeToFree for true, vamos criar um job para fazer o downgrade
        // quando a assinatura expirar
      }
    });

    // Se autoDowngradeToFree for true e houver uma data de término
    if (autoDowngradeToFree && subscriptionEndDate) {
      await scheduleSubscriptionDowngrade(user.id, new Date(subscriptionEndDate));
    }

    // Remove a senha do retorno
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 