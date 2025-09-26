'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';

const consultationFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.'),
  phone: z.string().min(10, 'Vui lòng nhập số điện thoại hợp lệ.'),
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ.'),
});

type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

export default function DesignConsultationPage() {
    const { toast } = useToast();
    const form = useForm<ConsultationFormValues>({
        resolver: zodResolver(consultationFormSchema),
        defaultValues: { name: '', phone: '', email: '' },
    });

    const onSubmit = (data: ConsultationFormValues) => {
        toast({
        title: 'Đã đặt lịch tư vấn!',
        description: 'Cảm ơn bạn! Đội ngũ thiết kế của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để sắp xếp cuộc hẹn.',
        });
        form.reset();
    };
    
    const processSteps = [
        { number: '01', title: 'Tư Vấn & Khảo Sát', description: 'Chúng tôi bắt đầu bằng việc tìm hiểu tầm nhìn, nhu cầu và ngân sách của bạn, sau đó là khảo sát chi tiết mặt bằng.' },
        { number: '02', title: 'Ý Tưởng & Thiết Kế 3D', description: 'Các nhà thiết kế của chúng tôi tạo ra một ý tưởng phù hợp với các bản vẽ 3D thực tế để bạn phê duyệt.' },
        { number: '03', title: 'Sản Xuất & Tìm Nguồn', description: 'Chúng tôi sản xuất các sản phẩm tùy chỉnh và tìm nguồn cung cấp vật liệu và đồ trang trí tốt nhất.' },
        { number: '04', title: 'Lắp Đặt & Bày Trí', description: 'Đội ngũ chuyên nghiệp của chúng tôi xử lý việc giao hàng, lắp ráp và bày trí cuối cùng một cách hoàn hảo.' },
        { number: '05', title: 'Bàn Giao & Bảo Hành', description: 'Chúng tôi sẽ giới thiệu cho bạn không gian mới của bạn và cung cấp bảo hành toàn diện để bạn yên tâm.' },
    ];
    
    const designers = [
        { name: 'Alice Johnson', role: 'Trưởng Nhóm Thiết Kế', image: 'https://picsum.photos/seed/d1/400/400' },
        { name: 'Ben Carter', role: 'Nhà Thiết Kế Cấp Cao', image: 'https://picsum.photos/seed/d2/400/400' },
        { name: 'Clara Williams', role: 'Quản Lý Dự Án', image: 'https://picsum.photos/seed/d3/400/400' },
    ];
    
    const projects = [
        { title: 'Căn Hộ Hiện Đại', image: 'https://picsum.photos/seed/proj1/600/800', hint: 'modern apartment' },
        { title: 'Biệt Thự Sang Trọng', image: 'https://picsum.photos/seed/proj2/600/800', hint: 'luxury villa' },
        { title: 'Nhà Phố Ấm Cúng', image: 'https://picsum.photos/seed/proj3/600/800', hint: 'cozy townhouse' },
    ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[60vh] min-h-[400px] rounded-lg overflow-hidden">
                <Image src="https://picsum.photos/seed/designhero/800/1000" alt="Thiết kế nội thất chuyên nghiệp" fill className="object-cover" data-ai-hint="interior design sketch" />
            </div>
            <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Thiết Kế Nội Thất Chuyên Nghiệp</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Biến đổi không gian của bạn với sự giúp đỡ của các nhà thiết kế chuyên nghiệp của chúng tôi. Chúng tôi cung cấp dịch vụ cá nhân hóa để tạo ra một ngôi nhà độc đáo của riêng bạn, kết hợp giữa phong cách, sự thoải mái và chức năng.
                </p>
                <div className='mt-6 space-y-2'>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Hình ảnh 3D:</strong> Xem thiết kế của bạn trước khi chúng tôi thi công.</p>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Phong cách cá nhân:</strong> Phù hợp với sở thích và lối sống của bạn.</p>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Dịch vụ trọn gói:</strong> Từ ý tưởng đến lắp đặt cuối cùng.</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 p-6 bg-secondary rounded-lg space-y-4">
                        <h3 className="font-headline text-xl font-bold">Đặt Lịch Tư Vấn Miễn Phí</h3>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Tên</FormLabel><FormControl><Input placeholder="Tên của bạn" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><Input placeholder="Số điện thoại của bạn" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Email của bạn" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Yêu Cầu Tư Vấn</Button>
                    </form>
                </Form>
            </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Quy Trình Thiết Kế Của Chúng Tôi</h2>
            <p className="mt-2 text-lg text-muted-foreground">Một hành trình 5 bước rõ ràng và hợp tác để đến ngôi nhà mơ ước của bạn.</p>
        </div>
        <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border" />
            <div className="relative grid md:grid-cols-5 gap-8">
                {processSteps.map(step => (
                    <div key={step.number} className="text-center flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-primary text-primary font-headline text-2xl font-bold z-10">{step.number}</div>
                        <h3 className="font-headline text-xl font-bold mt-4">{step.title}</h3>
                        <p className="mt-1 text-muted-foreground text-sm">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      <section className="bg-secondary">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Các Dự Án Tiêu Biểu</h2>
            <p className="mt-2 text-lg text-muted-foreground">Lấy cảm hứng từ một số biến đổi yêu thích của chúng tôi.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
                 <div key={project.title} className="group relative rounded-lg overflow-hidden shadow-lg">
                    <Image src={project.image} alt={project.title} width={600} height={800} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={project.hint} />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="font-headline text-2xl font-bold text-white">{project.title}</h3>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
