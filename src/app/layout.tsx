import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SiteHeader from '@/components/layout/header';
import SiteFooter from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Home Harmony',
  description: 'Discover curated furniture for your home.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Roboto:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative flex min-h-dvh flex-col bg-transparent">
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
