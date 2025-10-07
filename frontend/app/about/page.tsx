import Image from 'next/image';
import { Building, Users, Cpu, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const timelineEvents = [
    { year: 2018, event: 'NovaMarket ra mắt với mục tiêu kết nối người mua và nhà bán qua nền tảng thương mại điện tử toàn diện.' },
    { year: 2020, event: 'Đạt mốc 1 triệu đơn hàng, triển khai ví NovaPay và dịch vụ giao nhanh 2 giờ tại Hà Nội & TP.HCM.' },
    { year: 2022, event: 'Khánh thành trung tâm NovaFulfillment 20.000m², tích hợp quản lý kho và vận chuyển đa kênh.' },
    { year: 2023, event: 'Ra mắt hệ sinh thái marketing automation, hỗ trợ nhà bán tăng trưởng doanh thu gấp 3 lần.' },
    { year: 2024, event: 'Mở rộng cộng đồng lên 5 triệu khách hàng, 50.000 nhà bán và tiếp tục đầu tư vào trải nghiệm cá nhân hóa.' },
  ];

  const coreValues = [
    { icon: <Users className="h-10 w-10 text-primary" />, title: 'Khách hàng là trọng tâm', description: 'Mọi tính năng đều hướng đến trải nghiệm mua sắm mượt mà và dịch vụ chăm sóc tận tâm.' },
    { icon: <Cpu className="h-10 w-10 text-primary" />, title: 'Công nghệ thông minh', description: 'Hạ tầng dữ liệu và AI giúp tự động hóa vận hành, cá nhân hóa sản phẩm và dự báo nhu cầu.' },
    { icon: <TrendingUp className="h-10 w-10 text-primary" />, title: 'Tăng trưởng bền vững', description: 'Hợp tác chặt chẽ với đối tác logistics và nhà bán để xây dựng hệ sinh thái phát triển dài hạn.' },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">NovaMarket – Nền tảng thương mại điện tử toàn diện</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Chúng tôi xây dựng môi trường mua sắm thông minh nơi khách hàng tìm thấy sản phẩm yêu thích, nhà bán tăng trưởng bền vững và mọi giao dịch đều được vận hành bởi công nghệ hiện đại.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative">
          <div className="absolute left-1/2 -ml-0.5 w-0.5 h-full bg-border" aria-hidden="true"></div>
          {timelineEvents.map((item, index) => (
            <div key={item.year} className="relative mb-12">
              <div className="flex items-center">
                <div className="flex z-10 justify-center items-center w-8 h-8 bg-primary rounded-full ring-4 ring-background">
                  <Building className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 pl-8">
                  <p className="font-headline text-2xl font-bold text-primary">{item.year}</p>
                </div>
              </div>
              <div className="mt-4 ml-16">
                <p className="text-muted-foreground">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Giá Trị Cốt Lõi Của Chúng Tôi</h2>
            <p className="mt-2 text-lg text-muted-foreground">Những nguyên tắc định hướng mọi việc chúng tôi làm.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {coreValues.map((value) => (
              <div key={value.title} className="text-center flex flex-col items-center">
                {value.icon}
                <h3 className="font-headline text-2xl font-bold mt-4">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Hệ sinh thái NovaFulfillment</h2>
            <p className="mt-4 text-muted-foreground">
              Trung tâm fulfillment của chúng tôi được trang bị hệ thống quản lý kho tự động, đóng gói tiêu chuẩn và mạng lưới vận chuyển đối tác toàn quốc. Đội ngũ chuyên gia dữ liệu, marketing và chăm sóc khách hàng đồng hành cùng nhà bán để bứt phá doanh thu trên mọi kênh.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg">
                <Link href="/contact">Liên Hệ</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/seller">Đăng ký trở thành nhà bán</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80" 
              alt="Trung tâm logistics của NovaMarket" 
              fill 
              className="object-cover"
              data-ai-hint="modern ecommerce logistics center"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
