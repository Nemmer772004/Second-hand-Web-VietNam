'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export default function NewsletterPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-primary">
          <Mail className="mr-2 h-5 w-5" />
          NovaMarket Newsletter
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">
          Đăng ký nhận thông báo ưu đãi
        </h1>
        <p className="text-lg text-muted-foreground">
          Nhận tin độc quyền về flash sale, voucher và sản phẩm mới mỗi tuần. Chúng tôi chỉ gửi những nội dung thật sự giá trị cho bạn.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Input type="email" required placeholder="Nhập email của bạn" className="h-12 sm:w-80" />
          <Button type="submit" size="lg" className="h-12">Đăng ký</Button>
        </form>

        {submitted && (
          <p className="text-sm text-primary">
            ✅ Cảm ơn bạn! Hãy kiểm tra hòm thư để xác nhận đăng ký.
          </p>
        )}
      </div>
    </div>
  );
}
