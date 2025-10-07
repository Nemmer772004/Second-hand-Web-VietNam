'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, UtensilsCrossed, BarChart, ChefHat, Sparkles } from 'lucide-react';
import { products } from '@/lib/data';
import ProductCard from '@/components/products/product-card';
import type { Product as CatalogProduct } from '@/lib/types';
import type { Product as DemoProduct } from '@/lib/data';

const consultationFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.'),
  phone: z.string().min(10, 'Vui lòng nhập số điện thoại hợp lệ.'),
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ.'),
  restaurantType: z.string().min(3, 'Vui lòng nhập loại hình nhà hàng'),
  requirements: z.string().optional(),
});

type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

export default function SetupRestaurantPage() {
    const { toast } = useToast();
    const form = useForm<ConsultationFormValues>({
        resolver: zodResolver(consultationFormSchema),
        defaultValues: { name: '', phone: '', email: '', restaurantType: '' },
    });

    const onSubmit = (data: ConsultationFormValues) => {
        toast({
        title: 'Yêu cầu đã được gửi!',
        description: 'Cảm ơn bạn! Chuyên viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
        });
        form.reset();
    };
    
    const serviceBenefits = [
        { icon: <BarChart className='h-10 w-10 text-primary' />, title: 'Tiết Kiệm Chi Phí', description: 'Giảm tới 60% chi phí đầu tư ban đầu so với việc mua sắm thiết bị mới hoàn toàn.' },
        { icon: <ChefHat className='h-10 w-10 text-primary' />, title: 'Thiết Bị Chuyên Nghiệp', description: 'Cung cấp đầy đủ thiết bị bếp, tủ lạnh công nghiệp, bàn ghế... đã được kiểm tra chất lượng.' },
        { icon: <Sparkles className='h-10 w-10 text-primary' />, title: 'Tư Vấn Tận Tâm', description: 'Đội ngũ của chúng tôi sẽ giúp bạn lên kế hoạch và lựa chọn thiết bị phù hợp nhất với mô hình kinh doanh.' },
    ];
    
    const mapDemoToCatalog = (product: DemoProduct): CatalogProduct => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        productId: Number(product.id) || undefined,
        category: product.category,
    image: product.images[0] ?? '',
    stock: product.status === 'Còn Hàng' ? 20 : 0,
    rating: product.rating,
    averageRating: product.rating,
    reviewCount: product.reviewCount,
    reviews: [],
        features: Object.entries(product.specs || {}).map(([key, value]) => `${key}: ${value}`),
        dimensions: { width: 0, height: 0, depth: 0 },
        weight: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    });

    const featuredProducts = products
        .filter(p => p.category === 'do-nha-hang' || p.category === 'do-dien-lanh')
        .slice(0, 4)
        .map(mapDemoToCatalog);

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[60vh] min-h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image src="https://picsum.photos/seed/setup-hero/800/1000" alt="Setup nhà hàng chuyên nghiệp với đồ cũ" fill className="object-cover" data-ai-hint="restaurant interior setup" />
                 <div className="absolute inset-0 bg-black/40" />
                 <div className="absolute bottom-0 p-8 text-white">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Setup Nhà Hàng Trọn Gói</h1>
                    <p className="mt-2 text-lg">Giải pháp tối ưu chi phí, khởi nghiệp thành công.</p>
                 </div>
            </div>
            <div>
                <h2 className="font-bold text-2xl text-primary">BẮT ĐẦU NHÀ HÀNG MƠ ƯỚC CỦA BẠN</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                   Bạn đang ấp ủ một dự án ẩm thực nhưng nguồn vốn còn hạn chế? Dịch vụ setup nhà hàng, quán ăn trọn gói từ đồ cũ của Thiên Tiến là giải pháp hoàn hảo. Chúng tôi không chỉ cung cấp thiết bị, mà còn đồng hành cùng bạn trên con đường khởi nghiệp.
                </p>
                <div className='mt-6 space-y-2'>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Tư vấn miễn phí:</strong> Khảo sát và lên danh sách thiết bị phù hợp.</p>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Sản phẩm đa dạng:</strong> Từ bếp Á, bếp Âu, tủ đông, đến bàn ghế, chén đĩa.</p>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Bảo hành & Lắp đặt:</strong> Hỗ trợ lắp đặt và bảo hành thiết bị để bạn yên tâm kinh doanh.</p>
                </div>
                 <Button asChild size="lg" className="mt-8">
                    <a href="#consult-form">Nhận Tư Vấn Ngay</a>
                 </Button>
            </div>
        </div>
      </section>

       <section className="bg-secondary">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Tại Sao Chọn Dịch Vụ Của Chúng Tôi?</h2>
            <p className="mt-2 text-lg text-muted-foreground">Lợi ích vượt trội khi bạn chọn Thiên Tiến làm đối tác.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {serviceBenefits.map((value) => (
              <div key={value.title} className="text-center flex flex-col items-center p-6 bg-background rounded-lg shadow-md">
                {value.icon}
                <h3 className="font-headline text-2xl font-bold mt-4">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        <section aria-labelledby="featured-restaurant-products-heading" className="container mx-auto px-4">
            <div className="text-center">
            <h2 id="featured-restaurant-products-heading" className="font-headline text-3xl md:text-4xl font-bold">Thiết Bị Nhà Hàng Tiêu Biểu</h2>
            <p className="mt-2 text-lg text-muted-foreground">Khám phá các sản phẩm thiết yếu cho mọi căn bếp chuyên nghiệp.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
            <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
                <a href="/products?category=do-nha-hang">Xem Tất Cả Thiết Bị Nhà Hàng</a>
            </Button>
            </div>
      </section>

      <section id="consult-form" className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto p-8 bg-card rounded-xl shadow-2xl">
             <div className="text-center mb-8">
                <UtensilsCrossed className="mx-auto h-12 w-12 text-primary" />
                <h2 className="font-headline text-3xl md:text-4xl font-bold mt-4">Yêu Cầu Tư Vấn Setup</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Hãy để lại thông tin, chúng tôi sẽ liên hệ và cùng bạn xây dựng kế hoạch hoàn hảo.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                         <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Tên Của Bạn</FormLabel><FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Số Điện Thoại</FormLabel><FormControl><Input placeholder="09xxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="ban@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="restaurantType" render={({ field }) => (
                        <FormItem><FormLabel>Loại Hình Kinh Doanh</FormLabel><FormControl><Input placeholder="VD: Quán phở, nhà hàng lẩu, quán cafe..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="requirements" render={({ field }) => (
                        <FormItem><FormLabel>Yêu Cầu Sơ Bộ (không bắt buộc)</FormLabel><FormControl><Textarea placeholder="VD: Cần setup cho không gian 50m2, ngân sách 100 triệu, cần tủ đông, bếp á..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Tư Vấn'}
                    </Button>
                </form>
            </Form>
        </div>
      </section>

    </div>
  );
}
