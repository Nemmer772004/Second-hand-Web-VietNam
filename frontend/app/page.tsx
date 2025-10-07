'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { inspirationCategories, heroSlides } from '@/lib/data';
import ProductCard from '@/components/products/product-card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/lib/queries';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  // Fetch products from backend with refetch on mount
  const { data: productsData, loading: productsLoading, refetch } = useQuery(GET_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true
  });
  const featuredProducts = productsData?.products?.slice(0, 8) || [];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32">
      <section aria-labelledby="hero-heading">
        <Carousel
          opts={{
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="hero-slide">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="hero-image"
                    priority={index === 0}
                    data-ai-hint={slide.hint}
                  />
                  <div className="hero-overlay" />
                  <div className="hero-content">
                    <h1 id="hero-heading" className="hero-title">
                      {slide.title}
                    </h1>
                    <p className="hero-subtitle">
                      {slide.subtitle}
                    </p>
                    <Button asChild className="hero-button">
                      <Link href={slide.link}>
                        {slide.cta} <ArrowRight className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground bg-white/20 hover:bg-white/40 border-none" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground bg-white/20 hover:bg-white/40 border-none" />
        </Carousel>
      </section>

      <section aria-labelledby="featured-products-heading" className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="featured-products-heading" className="font-headline text-3xl md:text-4xl font-bold">Sản Phẩm Nổi Bật Hôm Nay</h2>
          <p className="mt-2 text-lg text-muted-foreground">Săn deal chính hãng từ các thương hiệu yêu thích, giá sốc mỗi ngày và ưu đãi vận chuyển siêu tốc.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => refetch()}
            disabled={productsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${productsLoading ? 'animate-spin' : ''}`} />
            {productsLoading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
        {productsLoading ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground">Đang tải sản phẩm...</p>
          </div>
        ) : (
          <>
            <div className="mt-4 text-sm text-muted-foreground">
              Hiển thị {featuredProducts.length} sản phẩm
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/products">Khám phá toàn bộ danh mục</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="brand-intro-heading" className="relative h-[500px] bg-fixed bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1920&q=80')"}} data-ai-hint="modern ecommerce logistics warehouse">
        <div className="absolute inset-0 bg-secondary/80" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center p-8 max-w-3xl bg-background/90 rounded-lg shadow-xl mx-4">
            <h2 id="brand-intro-heading" className="font-headline text-3xl md:text-4xl font-bold">NovaMarket – Nơi Mua Sắm Bắt Đầu</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Chúng tôi kết nối hàng triệu người mua và nhà bán qua nền tảng thương mại điện tử toàn diện: quản lý kho, thanh toán, vận chuyển và chiến dịch marketing chỉ trong một bảng điều khiển duy nhất.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/seller">Gia nhập nhà bán NovaMarket</Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="inspiration-heading" className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="inspiration-heading" className="font-headline text-3xl md:text-4xl font-bold">Cảm Hứng Mua Sắm</h2>
          <p className="mt-2 text-lg text-muted-foreground">Bộ sưu tập gợi ý được tuyển chọn bởi NovaMarket dành cho mọi phong cách sống.</p>
        </div>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full mt-12"
        >
          <CarouselContent>
            {inspirationCategories.map((category, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Link href={category.href} className="group block">
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <h3 className="font-headline text-2xl mt-4 group-hover:text-primary">{category.name}</h3>
                  <p className="mt-1 text-muted-foreground">{category.description}</p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section aria-labelledby="newsletter-heading" className="bg-secondary">
        <div className="container mx-auto px-4 py-16 text-center">
           <h2 id="newsletter-heading" className="font-headline text-3xl font-bold">Kết nối cùng NovaMarket</h2>
           <p className="mt-2 text-lg text-muted-foreground">Nhận ngay tin mới về flash sale, voucher độc quyền và xu hướng mua sắm mới nhất.</p>
           <form className="mt-6 max-w-md mx-auto flex gap-2">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="email" placeholder="Nhập email của bạn" className="pl-10 h-12" />
            </div>
             <Button type="submit" size="lg" className="h-12">Đăng ký</Button>
           </form>
        </div>
      </section>
    </div>
  );
}
