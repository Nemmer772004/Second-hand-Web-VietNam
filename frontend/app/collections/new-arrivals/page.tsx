'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageOpen } from 'lucide-react';

export default function NewArrivalsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <PackageOpen className="mr-2 h-5 w-5" />
          Hàng mới về
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Bộ sưu tập hàng mới sẽ được cập nhật liên tục
        </h1>
        <p className="text-lg text-muted-foreground">
          Chúng tôi đang làm việc với các thương hiệu để mang đến dòng sản phẩm mới nhất.
          Trong lúc chờ đợi, hãy khám phá danh mục sản phẩm hiện có trên NovaMarket.
        </p>
        <Button asChild>
          <Link href="/products">Khám phá sản phẩm</Link>
        </Button>
      </div>
    </div>
  );
}
