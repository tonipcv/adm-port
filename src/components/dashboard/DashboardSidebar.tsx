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
      description: 'Dashboard overview and statistics'
    },
    { 
      icon: Users, 
      label: 'Users', 
      href: '/dashboard/users',
      description: 'Manage system users'
    },
    { 
      icon: Briefcase, 
      label: 'Portfolios', 
      href: '/dashboard/portfolios',
      description: 'User portfolios management'
    },
    { 
      icon: Bitcoin, 
      label: 'Cryptos', 
      href: '/dashboard/cryptos',
      description: 'Cryptocurrency settings'
    },
    { 
      icon: CreditCard, 
      label: 'Subscriptions', 
      href: '/dashboard/subscriptions',
      description: 'Manage user subscriptions'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/dashboard/settings',
      description: 'System configurations'
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col w-64 bg-gray-950 border-r border-gray-800">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-gray-200">Administração Wallet</span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center w-full px-3 py-2.5 rounded-md transition-colors",
                    isActive
                      ? "bg-gray-800 text-gray-200"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Icon className={cn(
                      "h-5 w-5 mr-3 flex-shrink-0",
                      isActive ? "text-gray-200" : "text-gray-400 group-hover:text-gray-200"
                    )} />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-800/50 transition-colors cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-200">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@k17.com</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        {/* Logout Button */}
        <button className="mt-2 w-full flex items-center px-3 py-2.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors">
          <LogOut className="h-5 w-5 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
} 