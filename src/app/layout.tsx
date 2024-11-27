import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Administração Wallet | Gerenciamento de Carteiras Crypto',
  description: 'Sistema de administração para gerenciamento de carteiras de criptomoedas',
  keywords: ['crypto', 'wallet', 'administração', 'bitcoin', 'carteira digital', 'criptomoedas'],
  authors: [{ name: 'K17' }],
  creator: 'K17',
  publisher: 'K17',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://k17.com.br',
    siteName: 'Administração Wallet',
    title: 'Administração Wallet | Gerenciamento de Carteiras Crypto',
    description: 'Sistema de administração para gerenciamento de carteiras de criptomoedas',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Administração Wallet | Gerenciamento de Carteiras Crypto',
    description: 'Sistema de administração para gerenciamento de carteiras de criptomoedas',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
