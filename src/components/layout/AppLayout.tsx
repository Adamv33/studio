
'use client'; // Make AppLayout a client component

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import { Header } from './Header';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Don't do anything while auth state is loading
    }

    const publicPaths = ['/login', '/signup']; // '/onboarding-request' is special
    const isPublicPath = publicPaths.includes(pathname);
    const isOnboardingRequestPath = pathname === '/onboarding-request';

    if (!currentUser) {
      // No user logged in
      if (!isPublicPath && !isOnboardingRequestPath) { // Also allow onboarding request page if unauth, as it explains process
        router.push('/login');
      }
    } else {
      // User is logged in
      if (!userProfile || !userProfile.isApproved) {
        // User is logged in but not approved (or profile missing)
        if (!isOnboardingRequestPath && !isPublicPath /* allow access to /login or /signup to logout/etc if desired, though unlikely path */) {
          router.push('/onboarding-request');
        }
      } else {
        // User is logged in AND approved
        if (isPublicPath || isOnboardingRequestPath) {
          // If approved user is on login, signup or onboarding, redirect to dashboard
          router.push('/');
        }
      }
    }
  }, [currentUser, userProfile, loading, pathname, router]);

  if (loading) {
    // Show a basic loading state for the whole page
    // You can make this more sophisticated
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-card px-4 md:px-6 shadow-sm">
           <Skeleton className="h-8 w-32" />
           <div className="ml-auto flex items-center gap-3">
             <Skeleton className="h-8 w-8 rounded-full" />
             <Skeleton className="h-8 w-8 rounded-full" />
           </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden md:block w-64 border-r p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </aside>
          <main className="flex-1 p-8">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  // Determine if sidebar and header should be shown
  // Don't show for login, signup pages typically
  const showChrome = !['/login', '/signup'].includes(pathname);
  // Onboarding request page might also not need full chrome if it's meant to be simple
  // const showChrome = !['/login', '/signup', '/onboarding-request'].includes(pathname);


  if (!showChrome) {
    return <>{children}</>; // Render only page content for login/signup
  }

  // If user is not approved and not on onboarding, they'll be redirected by useEffect.
  // However, we might want to avoid rendering the main layout for them until redirect happens.
  // This check is a bit redundant due to useEffect but can prevent a flash of incorrect content.
  if (currentUser && (!userProfile || !userProfile.isApproved) && pathname !== '/onboarding-request') {
     // Still show a loading-like state or minimal layout until redirect completes
     return (
        <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-muted-foreground">Loading access status...</p>
          {/* Or a more specific message if redirecting to onboarding */}
        </div>
     );
  }


  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 flex items-center gap-2">
           <Logo className="w-8 h-8 text-sidebar-primary" />
           <h1 className="font-headline text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">InstructPoint</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-sidebar-foreground/70">&copy; {new Date().getFullYear()} InstructPoint</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
