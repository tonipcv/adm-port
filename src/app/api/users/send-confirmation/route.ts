import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createTransport } from 'nodemailer';
import { randomBytes } from 'crypto';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
});

export async function POST(request: Request) {
  let userId: string | undefined;
  let updatedUser;

  try {
    // 1. Validar dados de entrada
    const data = await request.json();
    userId = data.userId;
    const email = data.email;
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'UserId and email are required' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 2. Gerar token
    const confirmationToken = randomBytes(32).toString('hex');

    // 3. Atualizar usuário
    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { confirmationToken }
    });

    // 4. Enviar email
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${confirmationToken}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Confirme seu email - K17',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .container {
                padding: 20px;
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
              }
              .button {
                background-color: #4F46E5;
                color: white !important;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                margin: 20px 0;
              }
              .footer {
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Bem-vindo à K17!</h1>
              <p>Obrigado por se cadastrar. Para começar a usar nossa plataforma, precisamos confirmar seu endereço de email.</p>
              <p>Por favor, clique no botão abaixo para confirmar seu email:</p>
              <a href="${confirmationUrl}" class="button" style="color: white !important;">Confirmar Email</a>
              <p>Se você não solicitou esta confirmação, por favor ignore este email.</p>
              <div class="footer">
                <p>Este é um email automático, por favor não responda.</p>
                <p>K17 - Sua plataforma de gestão de portfólio crypto</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    return new Response(
      JSON.stringify({ message: 'Confirmation email sent successfully' }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Se houver erro e o usuário foi atualizado, reverter o token
    if (updatedUser?.id) {
      try {
        await prisma.user.update({
          where: { id: updatedUser.id },
          data: { confirmationToken: null }
        });
      } catch (revertError) {
        // Ignorar erro de reversão
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to send confirmation email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 