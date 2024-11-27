'use client';

import { useState } from 'react';
import { UserCircle, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0 ml-4">
              <h1 className="text-xl font-bold">Crypto Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="sm">
              <UserCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 