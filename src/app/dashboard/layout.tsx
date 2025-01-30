import { Metadata } from 'next';
import { Suspense } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Loading from "@/components/Loading";

export const metadata: Metadata = {
  title: 'Dashboard | Administração Wallet',
  description: 'Painel de controle para gerenciamento de carteiras de criptomoedas',
  robots: {
    index: false, // Protege o dashboard da indexação
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar />
      <main className="lg:pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 