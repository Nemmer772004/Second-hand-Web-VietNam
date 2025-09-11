import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SiteHeader from '@/components/layout/header';
import SiteFooter from '@/components/layout/footer';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context';
import { WishlistProvider } from '@/context/wishlist-context';

export const metadata: Metadata = {
  title: 'Home Harmony',
  description: 'Khám phá đồ nội thất được tuyển chọn cho ngôi nhà của bạn.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="relative flex min-h-dvh flex-col bg-transparent">
                <SiteHeader />
                <main className="flex-1">
                  {children}
                </main>
                <SiteFooter />
              </div>
              <Toaster />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
