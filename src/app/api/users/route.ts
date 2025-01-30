import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { scheduleSubscriptionDowngrade } from '@/lib/subscription';

const WEBHOOK_URL = 'https://hook.us1.make.com/6jot75gvs0fsosf8p271631htmbbijxu';

async function sendToWebhook(users: any[]) {
  const userData = users.map(user => ({
    name: user.name,
    email: user.email,
    whatsapp: user.whatsapp
  }));

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      console.error('Failed to send data to webhook:', await response.text());
    }
  } catch (error) {
    console.error('Error sending to webhook:', error);
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        whatsappVerified: true,
        verificationCode: true,
        verificationCodeExpiry: true,
        emailToken: true,
        emailTokenExpiry: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        resetToken: true,
        resetTokenExpiry: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionId: true,
        subscriptionEndDate: true,
        level: true,
        exchange: true,
        traditional_investment: true,
        crypto_investment: true,
        discovery: true,
        onboardingCompleted: true,
        provider: true,
        portfolios: {
          select: {
            id: true
          }
        },
        conversations: {
          select: {
            id: true
          }
        }
      }
    });

    // Enviar dados para o webhook
    await sendToWebhook(users);

    const usersWithCounts = users.map(user => ({
      ...user,
      portfoliosCount: user.portfolios.length,
      conversationsCount: user.conversations.length,
      portfolios: undefined,
      conversations: undefined
    }));

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
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