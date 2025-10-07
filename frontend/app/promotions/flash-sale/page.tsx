'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

export default function FlashSalePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Flame className="mr-2 h-5 w-5" />
          Flash Sale 10.10
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Chương trình sẽ ra mắt trong thời gian tới
        </h1>
        <p className="text-lg text-muted-foreground">
          NovaMarket đang chuẩn bị hàng nghìn deal độc quyền cho sự kiện flash sale tiếp theo.
          Đăng ký nhận bản tin để được thông báo ngay khi chương trình bắt đầu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/products">Khám phá sản phẩm nổi bật</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/newsletter">Đăng ký nhận thông báo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
