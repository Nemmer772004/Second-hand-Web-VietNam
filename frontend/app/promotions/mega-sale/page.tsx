'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function MegaSalePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Sparkles className="mr-2 h-5 w-5" />
          Mega Sale
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Mega Sale đang trong giai đoạn chuẩn bị cuối cùng
        </h1>
        <p className="text-lg text-muted-foreground">
          NovaMarket sẽ sớm công bố lịch trình Mega Sale kèm voucher giảm giá lên tới 70%.
          Đừng quên theo dõi trang ưu đãi và đăng ký nhận thông báo để không bỏ lỡ.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/promotions/flash-sale">Xem ưu đãi đang diễn ra</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/newsletter">Nhận thông báo Mega Sale</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
