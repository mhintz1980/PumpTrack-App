
'use client'; 

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarPinButton, 
  useSidebar, 
} from '@/components/ui/sidebar';
import { LayoutDashboard, BarChart2, CalendarDays, BrainCircuit } from 'lucide-react';

// Inner component to use the useSidebar hook correctly as it needs to be a child of SidebarProvider
function SidebarNavigationItems() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();

  const sidebarNavItems = [
    { href: '/', label: 'Kanban Board', icon: LayoutDashboard },
    { href: '/charts', label: 'Charts and Graphs', icon: BarChart2 },
    { href: '/schedule', label: 'Calendar and Schedule', icon: CalendarDays },
    { href: '/ai-query', label: 'A.I. Query', icon: BrainCircuit },
  ];

  return (
    <SidebarMenu>
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href} asChild>
              <Link href={item.href}>
                <Icon />
                {(isMobile || open) && <span>{item.label}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}


export function RootLayoutClientWrapper({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultPinned={false}>
      <Sidebar side="left" variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 p-2">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 100 100" className="text-sidebar-primary">
                <path fill="currentColor" d="M87.7,43.1a6.4,6.4,0,0,0-11.3,0L64,58.2V26.3a6.4,6.4,0,0,0-12.8,0V58.2L38.7,43.1a6.4,6.4,0,0,0-11.3,0L12.3,58.2a6.4,6.4,0,0,0,0,11.3l19.1,19.1a6.4,6.4,0,0,0,11.3,0L55.5,75.8a6.4,6.4,0,0,0,0-11.3L40.4,51.7l9.6-9.6V73.7a6.4,6.4,0,0,0,12.8,0V42.1l9.6,9.6L57.2,64.5a6.4,6.4,0,0,0,0,11.3l12.8,12.8a6.4,6.4,0,0,0,11.3,0l19.1-19.1a6.4,6.4,0,0,0,0-11.3ZM50,12.5a6.3,6.3,0,1,0,6.3,6.2A6.2,6.2,0,0,0,50,12.5Z"/>
              </svg>
              <span className="text-lg font-semibold text-sidebar-foreground group-data-[state=collapsed]:hidden">PumpTrack</span>
            </div>
            <SidebarPinButton />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigationItems />
        </SidebarContent>
        <SidebarFooter className="mt-auto p-2"> 
          {/* SidebarPinButton was here, now moved to SidebarHeader */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="h-full overflow-y-auto"> 
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
