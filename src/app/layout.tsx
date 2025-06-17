
import { GeistSans as GeistSansImport } from 'geist/font/sans';
import { GeistMono as GeistMonoImport } from 'geist/font/mono';
import { RootLayoutClientWrapper } from '@/components/layout/RootLayoutClientWrapper';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';

// Attempt to access .default on the nested .GeistSans property
// This is based on the error message implying GeistSansImport.GeistSans is an object.
const geistSansFontObject = GeistSansImport.GeistSans;
const geistMonoFontObject = GeistMonoImport.GeistMono;

// Check if the potentially nested object exists and has a default export that is a function
const geistSansFont = (typeof geistSansFontObject === 'object' && geistSansFontObject && typeof geistSansFontObject.default === 'function')
  ? geistSansFontObject.default({
      subsets: ['latin'],
      variable: '--font-geist-sans',
    })
  : GeistSansImport({ // Fallback to previous direct named import call if the above is not valid
      subsets: ['latin'],
      variable: '--font-geist-sans',
    });

const geistMonoFont = (typeof geistMonoFontObject === 'object' && geistMonoFontObject && typeof geistMonoFontObject.default === 'function')
  ? geistMonoFontObject.default({
      subsets: ['latin'],
      variable: '--font-geist-mono',
    })
  : GeistMonoImport({ // Fallback
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
      <body className={`${geistSansFont.variable} ${geistMonoFont.variable} font-sans antialiased`}>
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
