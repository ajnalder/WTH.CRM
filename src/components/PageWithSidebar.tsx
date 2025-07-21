
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { PageLayout } from "@/components/PageLayout";
import { VoiceCommandButton } from "@/components/voice/VoiceCommandButton";
import { VoiceDialogManager } from "@/components/voice/VoiceDialogManager";

interface PageWithSidebarProps {
  children: React.ReactNode;
}

export const PageWithSidebar: React.FC<PageWithSidebarProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>
          <PageLayout>
            {children}
            <VoiceCommandButton />
            <VoiceDialogManager />
          </PageLayout>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
