'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export default function SellerOnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Store className="mr-2 h-5 w-5" />
          Dành cho nhà bán
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Chương trình onboarding đang mở đăng ký thử nghiệm</h1>
        <p className="text-lg text-muted-foreground">
          Hãy để lại thông tin, đội ngũ NovaMarket sẽ liên hệ và cung cấp bộ tài liệu hướng dẫn mở gian hàng, tích hợp kho và triển khai marketing chỉ trong vài bước.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/contact">Đăng ký làm nhà bán</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">Tìm hiểu hệ sinh thái NovaMarket</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
