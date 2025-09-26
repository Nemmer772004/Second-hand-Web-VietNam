import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "../components/ui/toaster";
import SiteHeader from '../components/layout/header';
import SiteFooter from '../components/layout/footer';
import { CartProvider } from '../context/cart-context';
import { AuthProvider } from '../context/auth-context';
import { WishlistProvider } from '../context/wishlist-context';
import { ApolloWrapper } from '../components/providers/apollo-provider';
import FloatingSupportButtons from '../components/support/floating-support';

export const metadata: Metadata = {
  title: 'Đồ Cũ Bảo Anh - Mua Bán Đồ Cũ Giá Tốt',
  description: 'Chuyên thu mua và thanh lý đồ cũ, thiết bị nhà hàng, điện lạnh, văn phòng tại Hà Nội. Giá cao, uy tín, chuyên nghiệp.',
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
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ApolloWrapper>
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
                <FloatingSupportButtons />
                <Toaster />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
