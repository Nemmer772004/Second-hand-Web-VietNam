'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';

export default function VoucherPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Ticket className="mr-2 h-5 w-5" />
          Voucher độc quyền
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Bộ sưu tập voucher mới đang được cập nhật
        </h1>
        <p className="text-lg text-muted-foreground">
          Chúng tôi đang tổng hợp hàng loạt mã giảm giá từ các thương hiệu yêu thích.
          Quay lại sau ít phút hoặc truy cập trang ưu đãi để chọn deal phù hợp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/promotions/flash-sale">Xem Flash Sale</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Săn sản phẩm nổi bật</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
