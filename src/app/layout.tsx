
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// Attempt to use default imports directly
import GeistSansFontFunction from 'geist/font/sans';
import GeistMonoFontFunction from 'geist/font/mono';
import { RootLayoutClientWrapper } from '@/components/layout/RootLayoutClientWrapper';

// Initialize fonts using the default imports
const geistSans = GeistSansFontFunction({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = GeistMonoFontFunction({
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
