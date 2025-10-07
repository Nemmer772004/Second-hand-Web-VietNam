'use client';

import Image from 'next/image';
import { inspirationCategories } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function InspirationPage() {
  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', alt: 'Tai nghe không dây thời trang', hint: 'wireless headphones on colorful background' },
    { src: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80', alt: 'Bộ sưu tập thời trang đường phố', hint: 'street fashion collection flatlay' },
    { src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80', alt: 'Điện thoại và phụ kiện công nghệ', hint: 'smartphone with accessories layout' },
    { src: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80', alt: 'Không gian làm việc tại nhà hiện đại', hint: 'modern home office desk setup' },
    { src: 'https://images.unsplash.com/photo-1598514982901-9c09c1ab7364?auto=format&fit=crop&w=900&q=80', alt: 'Sản phẩm làm đẹp và chăm sóc da', hint: 'beauty cosmetic products flatlay' },
    { src: 'https://images.unsplash.com/photo-1545239351-4c927ccf7d1b?auto=format&fit=crop&w=900&q=80', alt: 'Gian hàng thương mại điện tử với hộp giao hàng', hint: 'ecommerce packaging boxes stacked' },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-12">
      <section className="container mx-auto px-4 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Cảm Hứng Mua Sắm</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Khám phá những concept thời thượng và xu hướng tiêu dùng mới nhất. NovaMarket gợi ý cách phối đồ, trang trí nhà cửa và lựa chọn thiết bị công nghệ để nâng tầm phong cách sống của bạn.
        </p>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">Bộ sưu tập tuyển chọn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {inspirationCategories.map((category) => (
            <div key={category.name} className="group relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={category.image}
                alt={category.name}
                width={400}
                height={500}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={category.hint}
              />
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="font-headline text-2xl font-bold">{category.name}</h3>
                  <p className="text-sm mt-1">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="mx-auto h-12 w-12 text-primary" />
            <h2 className="font-headline text-3xl md:text-4xl font-bold mt-4">Cẩm nang mua sắm thông minh</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Đội ngũ NovaMarket luôn nghiên cứu insight người dùng để mang tới trải nghiệm cá nhân hóa. Dưới đây là một số gợi ý giúp bạn tối ưu giỏ hàng và ngân sách.
            </p>
            <div className="mt-8 grid gap-4 text-left">
              {[
                '5 mẹo săn flash sale mà không bỏ lỡ sản phẩm hot',
                'Hướng dẫn chọn laptop phù hợp cho làm việc từ xa',
                'Combo chăm sóc da toàn diện dưới 1 triệu đồng',
              ].map((tip) => (
                <Card key={tip} className="bg-background/80">
                  <CardContent className="p-4 text-base font-medium text-muted-foreground">
                    {tip}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleryImages.map((img, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg break-inside-avoid">
              <Image
                src={img.src}
                alt={img.alt}
                width={600}
                height={800}
                className="w-full h-auto object-cover"
                data-ai-hint={img.hint}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
