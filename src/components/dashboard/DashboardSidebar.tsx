'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Briefcase, 
  CreditCard,
  Settings,
  Bitcoin,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      icon: Home, 
      label: 'Overview', 
      href: '/dashboard',
    },
    { 
      icon: Users, 
      label: 'Users', 
      href: '/dashboard/users',
    },
    { 
      icon: Briefcase, 
      label: 'Portfolios', 
      href: '/dashboard/portfolios',
    },
    { 
      icon: Bitcoin, 
      label: 'Cryptos', 
      href: '/dashboard/cryptos',
    },
    { 
      icon: CreditCard, 
      label: 'Subscriptions', 
      href: '/dashboard/subscriptions',
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/dashboard/settings',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col w-64 bg-black border-r border-zinc-900">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-900">
        <span className="text-lg font-medium text-zinc-100">Administração Wallet</span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-4">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center w-full px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Icon className={cn(
                      "h-4 w-4 mr-3 flex-shrink-0",
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-200"
                    )} />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-zinc-900 p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-900/50 transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-sm font-medium text-zinc-200">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">Admin User</p>
            <p className="text-xs text-zinc-500 truncate">admin@k17.com</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="mt-2 w-full flex items-center px-3 py-2 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors">
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
} 