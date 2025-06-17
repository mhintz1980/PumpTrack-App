import './globals.css'
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { RootLayoutClientWrapper } from '@/components/layout/RootLayoutClientWrapper';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';

// GeistSans and GeistMono are now metadata objects. Access their properties directly.
const geistSansFontClassName = GeistSans.variable;
const geistMonoFontClassName = GeistMono.variable;

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
      <body className={`${geistSansFontClassName} ${geistMonoFontClassName} font-sans antialiased`}>
        {/* 
          This comment is for addressing the "params are being enumerated" warning.
          The warning indicates that 'params' or 'searchParams' might be enumerated directly
          (e.g., Object.keys(params)) in a Server Component.
          If this warning persists, check all Server Components for direct enumeration of these objects.
          Client Components like this page should use hooks (useParams, useSearchParams) instead.
          The RootLayout itself does not use params/searchParams directly.
        */}
        {/* 
          Note from server logs: "Slow filesystem detected." 
          This is a performance warning from Next.js/Turbopack and doesn't prevent startup.
          If performance issues are noticed, consider the advice in the log.
        */}
        <RootLayoutClientWrapper>
          {children}
        </RootLayoutClientWrapper>
        <Toaster />
      </body>
    </html>
  );
}
