import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createTransport } from 'nodemailer';
import { randomBytes } from 'crypto';

// Configuração do transportador SMTP
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  let updatedUser;

  try {
    console.log('1. Iniciando processo de envio...');
    
    const { userId, email } = await request.json();
    console.log('2. Dados recebidos:', { userId, email });
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'UserId and email are required' }, { status: 400 });
    }

    // Verificar configurações SMTP
    console.log('3. Configurações SMTP:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM
    });

    // Gerar token de confirmação
    const confirmationToken = randomBytes(32).toString('hex');
    console.log('4. Token gerado:', confirmationToken);

    try {
      // Salvar token no banco de dados
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { confirmationToken }
      });
      console.log('5. Token salvo no banco para o usuário:', updatedUser.id);
    } catch (dbError) {
      console.error('Erro ao atualizar usuário:', dbError);
      return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 });
    }

    // Enviar email de confirmação
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${confirmationToken}`;
    console.log('6. URL de confirmação:', confirmationUrl);

    try {
      // Testar conexão SMTP antes de enviar
      console.log('7. Testando conexão SMTP...');
      await transporter.verify();
      console.log('8. Conexão SMTP OK');

      // Enviar email
      console.log('9. Tentando enviar email...');
      const info = await transporter.sendMail({
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
      console.log('10. Email enviado com sucesso:', info);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Se falhar ao enviar o email, reverte o token
      if (updatedUser) {
        await prisma.user.update({
          where: { id: updatedUser.id },
          data: { confirmationToken: null }
        });
      }
      return NextResponse.json({ error: 'Failed to send email: ' + emailError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json({ 
      error: 'Failed to process request: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
} 