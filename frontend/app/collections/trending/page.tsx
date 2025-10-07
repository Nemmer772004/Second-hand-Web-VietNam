'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export default function TrendingCollectionPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <TrendingUp className="mr-2 h-5 w-5" />
          Xu hướng 2024
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Trang xu hướng đang được cập nhật
        </h1>
        <p className="text-lg text-muted-foreground">
          NovaMarket sẽ sớm giới thiệu các bộ sưu tập theo xu hướng mới nhất.
          Ghé lại sau nhé hoặc tiếp tục khám phá những sản phẩm nổi bật hôm nay.
        </p>
        <Button asChild>
          <Link href="/products">Xem sản phẩm nổi bật</Link>
        </Button>
      </div>
    </div>
  );
}
