'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.'),
  email: z.string().email('Vui lòng nhập một địa chỉ email hợp lệ.'),
  subject: z.string().min(5, 'Chủ đề phải có ít nhất 5 ký tự.'),
  message: z.string().min(10, 'Tin nhắn phải có ít nhất 10 ký tự.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    toast({
      title: 'Tin nhắn đã được gửi!',
      description: 'Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ trả lời bạn sớm nhất có thể.',
    });
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Liên Hệ</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          NovaMarket luôn sẵn sàng đồng hành cùng bạn 24/7. Vui lòng liên hệ qua biểu mẫu, email, hotline hoặc ghé trung tâm dịch vụ khách hàng để được hỗ trợ nhanh nhất.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và Tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ Email</FormLabel>
                      <FormControl>
                        <Input placeholder="ban@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chủ đề</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Hỗ trợ đơn Flash Sale, kích hoạt voucher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả vấn đề hoặc nhu cầu của bạn, NovaMarket sẽ phản hồi trong vòng 2 giờ làm việc." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
              </Button>
            </form>
          </Form>
        </div>

        <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold">Thông Tin Liên Hệ</h2>
            <div className="space-y-4">
                <Link href="mailto:support@novamarket.vn" className="flex items-center gap-4 group">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground group-hover:text-primary">support@novamarket.vn</span>
                </Link>
                <Link href="tel:19001234" className="flex items-center gap-4 group">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground group-hover:text-primary">1900 1234</span>
                </Link>
                <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <p className="text-muted-foreground">
                        Tầng 12, NovaMall Tower<br />
                        35 Nguyễn Huệ, Quận 1, TP.HCM<br />
                        Việt Nam
                    </p>
                </div>
            </div>
            <div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.493935640602!2d106.69940967642088!3d10.773374959221112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3d9f6fa5c1%3A0xf7b8f10c1d0d70bd!2sNguyen%20Hue%20Walking%20Street!5e0!3m2!1svi!2s!4v1725690000000!5m2!1svi!2s"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-md"
              ></iframe>
            </div>
        </div>
      </div>
    </div>
  );
}
