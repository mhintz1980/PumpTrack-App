
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Geist, Geist_Mono } from 'next/font/google';
import { RootLayoutClientWrapper } from '@/components/layout/RootLayoutClientWrapper'; // Import the new client wrapper

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <RootLayoutClientWrapper>
          {children}
        </RootLayoutClientWrapper>
        <Toaster />
      </body>
    </html>
  );
}
