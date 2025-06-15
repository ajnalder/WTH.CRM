
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarInset, SidebarTrigger } from './ui/sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border mx-2" />
          <h1 className="text-lg font-semibold">ProjectFlow</h1>
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
};
