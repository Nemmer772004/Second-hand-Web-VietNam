'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenSquare } from 'lucide-react';

export default function BlogPlaceholderPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <PenSquare className="mr-2 h-5 w-5" />
          NovaMarket Blog
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Góc chia sẻ đang được xây dựng
        </h1>
        <p className="text-lg text-muted-foreground">
          Chúng tôi sẽ sớm ra mắt các bài viết về mẹo mua sắm thông minh, quản lý cửa hàng và câu chuyện thành công của nhà bán trên NovaMarket.
        </p>
        <Button asChild>
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </div>
  );
}
