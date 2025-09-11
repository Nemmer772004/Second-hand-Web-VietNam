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
import { ArrowDown, DollarSign, Handshake, Phone, Upload, UserCheck } from 'lucide-react';
import Link from 'next/link';

const purchaseFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.'),
  phone: z.string().min(10, 'Vui lòng nhập số điện thoại hợp lệ.'),
  address: z.string().min(10, 'Vui lòng nhập địa chỉ của bạn'),
  items: z.string().min(10, 'Vui lòng mô tả sản phẩm bạn muốn bán.'),
  image: z.any().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export default function PurchasePage() {
    const { toast } = useToast();
    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
    });

    const onSubmit = (data: PurchaseFormValues) => {
        console.log(data);
        toast({
        title: 'Đã gửi yêu cầu thu mua!',
        description: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ để báo giá trong thời gian sớm nhất.',
        });
        form.reset();
    };

    const processSteps = [
        {
            icon: <Phone className="h-10 w-10 text-primary" />,
            title: 'Bước 1: Gửi Yêu Cầu',
            description: 'Điền thông tin và hình ảnh sản phẩm bạn muốn thanh lý vào form bên dưới hoặc gọi trực tiếp cho chúng tôi.'
        },
        {
            icon: <DollarSign className="h-10 w-10 text-primary" />,
            title: 'Bước 2: Nhận Báo Giá',
            description: 'Đội ngũ của chúng tôi sẽ nhanh chóng thẩm định và gửi cho bạn báo giá tốt nhất thị trường chỉ sau 15 phút.'
        },
        {
            icon: <UserCheck className="h-10 w-10 text-primary" />,
            title: 'Bước 3: Thu Mua Tại Nhà',
            description: 'Nếu bạn đồng ý, chúng tôi sẽ cho nhân viên đến tận nơi để kiểm tra, tháo dỡ và vận chuyển.'
        },
        {
            icon: <Handshake className="h-10 w-10 text-primary" />,
            title: 'Bước 4: Thanh Toán Nhanh Gọn',
            description: 'Thanh toán 100% ngay tại chỗ bằng tiền mặt hoặc chuyển khoản ngay sau khi thỏa thuận hoàn tất.'
        }
    ];

    const itemCategories = [
        { name: "Thiết Bị Nhà Hàng", image: "https://picsum.photos/seed/cat1/400/300", hint: "restaurant equipment" },
        { name: "Đồ Điện Lạnh", image: "https://picsum.photos/seed/cat2/400/300", hint: "refrigeration equipment" },
        { name: "Nội Thất Văn Phòng", image: "https://picsum.photos/seed/cat3/400/300", hint: "office furniture" },
        { name: "Đồ Gia Dụng", image: "https://picsum.photos/seed/cat4/400/300", hint: "home appliances" },
    ];

    return (
        <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
            <section className="container mx-auto px-4">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Thu Mua Đồ Cũ Giá Cao</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Bạn có đồ cũ không dùng đến? Từ thiết bị nhà hàng, đồ điện lạnh đến nội thất văn phòng, chúng tôi thu mua tất cả với giá cao, quy trình minh bạch và nhanh chóng tại Hà Nội và các tỉnh lân cận.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <a href="#purchase-form">Gửi Yêu Cầu Định Giá Ngay <ArrowDown className="ml-2 h-5 w-5" /></a>
                    </Button>
                </div>
            </section>

            <section className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Quy Trình 4 Bước Đơn Giản</h2>
                     <p className="mt-2 text-lg text-muted-foreground">Minh bạch, chuyên nghiệp và luôn đặt lợi ích của bạn lên hàng đầu.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {processSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-md">
                            {step.icon}
                            <h3 className="font-headline text-xl font-bold mt-4">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground text-sm">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            <section className="bg-secondary">
                 <div className="container mx-auto px-4 py-24">
                     <div className="text-center mb-12">
                        <h2 className="font-headline text-3xl md:text-4xl font-bold">Chúng Tôi Thu Mua Những Gì?</h2>
                        <p className="mt-2 text-lg text-muted-foreground">Chuyên thu mua đa dạng các loại đồ cũ với số lượng lớn.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {itemCategories.map((cat) => (
                             <div key={cat.name} className="group relative rounded-lg overflow-hidden shadow-lg">
                                <Image 
                                    src={cat.image} 
                                    alt={cat.name} 
                                    width={400} 
                                    height={300} 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={cat.hint}
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <h3 className="font-headline text-2xl font-bold text-white text-center p-4">{cat.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </section>

            <section id="purchase-form" className="container mx-auto px-4">
                <div className="grid lg:grid-cols-5 gap-12 items-center">
                    <div className="lg:col-span-2">
                        <h2 className="font-headline text-3xl md:text-4xl font-bold">Gửi Yêu Cầu Định Giá Online</h2>
                        <p className="mt-4 text-muted-foreground">
                           Chỉ cần điền thông tin và tải lên hình ảnh sản phẩm, chúng tôi sẽ gửi báo giá sơ bộ cho bạn trong vòng 15 phút. Nhanh chóng, tiện lợi và hoàn toàn miễn phí!
                        </p>
                        <div className="mt-6 p-4 border-l-4 border-primary bg-secondary rounded-r-lg">
                           <p className="font-bold">Hoặc gọi ngay cho chúng tôi để được hỗ trợ tức thì:</p>
                           <Link href="tel:0984115339" className="text-2xl font-bold text-primary hover:underline">0984 11 53 39</Link>
                        </div>
                    </div>
                     <div className="lg:col-span-3 p-8 bg-card rounded-xl shadow-2xl">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                               <div className="grid sm:grid-cols-2 gap-6">
                                     <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Tên của bạn</FormLabel><FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><Input placeholder="SĐT để chúng tôi liên hệ" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                               </div>
                                <FormField control={form.control} name="address" render={({ field }) => (
                                    <FormItem><FormLabel>Địa chỉ</FormLabel><FormControl><Input placeholder="Địa chỉ thu mua" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="items" render={({ field }) => (
                                    <FormItem><FormLabel>Mô tả sản phẩm cần bán</FormLabel><FormControl><Textarea placeholder="Ví dụ: 1 tủ lạnh công nghiệp 4 cánh, 10 bộ bàn ghế inox..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="image" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hình ảnh sản phẩm (nếu có)</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                                                <Upload className="w-12 h-12 text-muted-foreground"/>
                                                <Input type="file" className="mt-4"/>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu & Nhận Báo Giá'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </section>

        </div>
    );
}
