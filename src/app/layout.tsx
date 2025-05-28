
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a common sans-serif, Geist is fine too
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Geist, Geist_Mono } from 'next/font/google';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, BarChart2, CalendarDays, BrainCircuit } from 'lucide-react';
import { usePathname } from 'next/navigation'; // Will need "use client" for this hook

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PumpTrack',
  description: 'Track your pumps through the workflow with PumpTrack.',
};

// RootLayoutContent is introduced to use usePathname
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarNavItems = [
    { href: '/', label: 'Kanban Board', icon: LayoutDashboard },
    { href: '#', label: 'Charts and Graphs', icon: BarChart2 }, // Replace # with actual path later
    { href: '#', label: 'Calendar and Schedule', icon: CalendarDays }, // Replace # with actual path later
    { href: '/ai-query', label: 'A.I. Query', icon: BrainCircuit },
  ];

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-sidebar-primary">
              <path fill="currentColor" d="M87.7,43.1a6.4,6.4,0,0,0-11.3,0L64,58.2V26.3a6.4,6.4,0,0,0-12.8,0V58.2L38.7,43.1a6.4,6.4,0,0,0-11.3,0L12.3,58.2a6.4,6.4,0,0,0,0,11.3l19.1,19.1a6.4,6.4,0,0,0,11.3,0L55.5,75.8a6.4,6.4,0,0,0,0-11.3L40.4,51.7l9.6-9.6V73.7a6.4,6.4,0,0,0,12.8,0V42.1l9.6,9.6L57.2,64.5a6.4,6.4,0,0,0,0,11.3l12.8,12.8a6.4,6.4,0,0,0,11.3,0l19.1-19.1a6.4,6.4,0,0,0,0-11.3ZM50,12.5a6.3,6.3,0,1,0,6.3,6.2A6.2,6.2,0,0,0,50,12.5Z"/>
            </svg>
            <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">PumpTrack</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href} asChild>
                    <Link href={item.href}>
                      <Icon /> {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-card p-3 shadow-sm sticky top-0 z-30 flex items-center gap-2 border-b">
          <SidebarTrigger />
          {/* Minimal global header, app title could go here if needed, or kept in specific page headers */}
          {/* <h1 className="text-xl font-semibold text-primary">PumpTrack</h1> */}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* To use usePathname, we need a client component boundary or to lift it up */}
        {/* For simplicity, we'll wrap the content that needs the pathname in a client component */}
        {/* However, for layout, it's better to structure so that layout itself can be server and pass data or a client component renders the dynamic parts */}
        {/* The simplest fix without major restructuring is to make RootLayoutContent a client component implicitly by using the hook */}
        {/* Let's make RootLayout a client component for now as it uses usePathname directly */}
        {/* This is not ideal for server components within, but will fix the immediate issue */}
        {/* A better pattern would be to have a ClientLayoutPart that uses usePathname and renders the sidebar */}

        {/* Correct approach: make a component that uses the hook */}
        <RootLayoutClientWrapper>
          {children}
        </RootLayoutClientWrapper>
        <Toaster />
      </body>
    </html>
  );
}

// This wrapper component can be a client component
function RootLayoutClientWrapper({ children }: { children: React.ReactNode }) {
  'use client'; // Add "use client" here
  const pathname = usePathname();

  const sidebarNavItems = [
    { href: '/', label: 'Kanban Board', icon: LayoutDashboard },
    { href: '/charts', label: 'Charts and Graphs', icon: BarChart2 }, // Updated href placeholder
    { href: '/schedule', label: 'Calendar and Schedule', icon: CalendarDays }, // Updated href placeholder
    { href: '/ai-query', label: 'A.I. Query', icon: BrainCircuit },
  ];

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-sidebar-primary">
              <path fill="currentColor" d="M87.7,43.1a6.4,6.4,0,0,0-11.3,0L64,58.2V26.3a6.4,6.4,0,0,0-12.8,0V58.2L38.7,43.1a6.4,6.4,0,0,0-11.3,0L12.3,58.2a6.4,6.4,0,0,0,0,11.3l19.1,19.1a6.4,6.4,0,0,0,11.3,0L55.5,75.8a6.4,6.4,0,0,0,0-11.3L40.4,51.7l9.6-9.6V73.7a6.4,6.4,0,0,0,12.8,0V42.1l9.6,9.6L57.2,64.5a6.4,6.4,0,0,0,0,11.3l12.8,12.8a6.4,6.4,0,0,0,11.3,0l19.1-19.1a6.4,6.4,0,0,0,0-11.3ZM50,12.5a6.3,6.3,0,1,0,6.3,6.2A6.2,6.2,0,0,0,50,12.5Z"/>
            </svg>
            <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">PumpTrack</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href} asChild>
                    <Link href={item.href}>
                      <Icon /> {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-card p-3 shadow-sm sticky top-0 z-30 flex items-center gap-2 border-b h-[57px]"> {/* Approx height of old header */}
          <SidebarTrigger />
          {/* <h1 className="text-xl font-semibold text-primary">PumpTrack</h1> */} {/* Title can be in page-specific headers */}
        </header>
        <div className="h-[calc(100vh-57px)] overflow-y-auto"> {/* Adjust height to account for new global header */}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
