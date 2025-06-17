
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// Use namespace imports
import * as GeistSansModule from 'geist/font/sans';
import * as GeistMonoModule from 'geist/font/mono';
import { RootLayoutClientWrapper } from '@/components/layout/RootLayoutClientWrapper';

// Initialize fonts using the named exports from the imported modules
const geistSans = GeistSansModule.GeistSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = GeistMonoModule.GeistMono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
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
        {/* This comment is for addressing the "params are being enumerated" warning.
            The warning indicates that 'params' or 'searchParams' might be enumerated directly
            (e.g., Object.keys(params)) in a Server Component.
            If this warning persists, check all Server Components for direct enumeration of these objects.
            Client Components like this page should use hooks (useParams, useSearchParams) instead.
            The RootLayout itself does not use params/searchParams directly.
        */}
        <RootLayoutClientWrapper>
          {children}
        </RootLayoutClientWrapper>
        <Toaster />
      </body>
    </html>
  );
}
