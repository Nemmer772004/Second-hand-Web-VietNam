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
  title: 'NovaMarket - Sàn Thương Mại Điện Tử Đa Ngành',
  description: 'NovaMarket mang đến trải nghiệm mua sắm trực tuyến hiện đại với hàng ngàn sản phẩm chính hãng, ưu đãi độc quyền và dịch vụ hậu mãi tận tâm.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
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
