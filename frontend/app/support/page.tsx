'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';

export default function SupportPlaceholderPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <LifeBuoy className="mr-2 h-5 w-5" />
          Trung tâm hỗ trợ
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Trang hỗ trợ đang được cập nhật
        </h1>
        <p className="text-lg text-muted-foreground">
          NovaMarket đang hoàn thiện hệ thống trợ giúp tự động và kho tri thức cho khách hàng. Vui lòng liên hệ hotline 1900 1234 hoặc gửi yêu cầu tại trang liên hệ trong thời gian chờ đợi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/contact">Liên hệ hỗ trợ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/faq">Xem câu hỏi thường gặp</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
