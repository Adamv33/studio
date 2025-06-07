"use client"
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        {/* Placeholder for breadcrumbs or page title if needed */}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User Profile">
          <UserCircle2 className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
