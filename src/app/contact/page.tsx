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
          Bạn có câu hỏi hoặc cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn lòng giúp đỡ. Hãy liên hệ với chúng tôi qua biểu mẫu dưới đây, email, điện thoại hoặc ghé thăm phòng trưng bày của chúng tôi.
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
                      <Input placeholder="Yêu cầu về Sofa Nhung Mơ Mộng" {...field} />
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
                      <Textarea placeholder="Hãy cho chúng tôi biết chúng tôi có thể giúp gì cho bạn..." className="min-h-[150px]" {...field} />
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
                <Link href="mailto:support@homeharmony.com" className="flex items-center gap-4 group">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground group-hover:text-primary">support@homeharmony.com</span>
                </Link>
                <Link href="tel:0984115339" className="flex items-center gap-4 group">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="text-muted-foreground group-hover:text-primary">0984115339</span>
                </Link>
                <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <p className="text-muted-foreground">
                        Số 150 Ngõ 1277 Giải Phóng<br />
                        Hoàng Mai, Hà Nội<br />
                        Việt Nam
                    </p>
                </div>
            </div>
            <div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.399516641571!2d105.84369417594043!3d20.97693528066224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac5dfa705a39%3A0x8d3132e407f35319!2zMTIzMiDEkC4gR2nhuqNpIFBow7NuZywgSG_DoG5nIE1haSwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1719213898090!5m2!1svi!2s"
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
