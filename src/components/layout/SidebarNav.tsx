
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, BarChart3, FolderKanban, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/instructors', label: 'Instructors', icon: Users },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/courses/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/curriculum', label: 'Curriculum', icon: FolderKanban },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  // Personal documents are part of instructor profile, so no separate nav item here.
  // { href: '/settings', label: 'Settings', icon: Settings }, // Example for future
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href}>
              <SidebarMenuButton
                variant="default"
                className={cn(
                  'w-full justify-start',
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
                isActive={isActive}
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
