import Image from 'next/image';
import { Building, Users, Recycle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const timelineEvents = [
    { year: 2010, event: 'Thành lập với một cửa hàng nhỏ, tập trung thu mua đồ cũ từ các hộ gia đình.' },
    { year: 2015, event: 'Mở rộng sang lĩnh vực thu mua thiết bị nhà hàng, văn phòng. Khai trương kho hàng đầu tiên tại Hoài Đức.' },
    { year: 2018, event: 'Trở thành đối tác thanh lý cho nhiều chuỗi nhà hàng lớn tại Hà Nội, khẳng định uy tín.' },
    { year: 2021, event: 'Ra mắt website, đưa hoạt động kinh doanh lên nền tảng online, tiếp cận nhiều khách hàng hơn.' },
    { year: 2024, event: 'Kỷ niệm hơn 10 năm phát triển, với 2 chi nhánh và đội ngũ chuyên nghiệp, trở thành một trong những đơn vị hàng đầu trong ngành.' },
  ];

  const coreValues = [
    { icon: <TrendingUp className="h-10 w-10 text-primary" />, title: 'Giá Tốt Nhất', description: 'Chúng tôi cam kết định giá sản phẩm cao và minh bạch, đảm bảo lợi ích cho khách hàng.' },
    { icon: <Recycle className="h-10 w-10 text-primary" />, title: 'Bền Vững & Tái Chế', description: 'Mỗi sản phẩm được thu mua là một đóng góp vào việc bảo vệ môi trường và vòng đời kinh tế.' },
    { icon: <Users className="h-10 w-10 text-primary" />, title: 'Chuyên Nghiệp & Nhanh Chóng', description: 'Quy trình thu mua nhanh gọn, đội ngũ tận tâm, hỗ trợ khách hàng từ A-Z.' },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Thu Mua Nhanh Gọn - Thanh Lý Dễ Dàng</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Từ năm 2010, Đồ Cũ Bảo Anh đã là cầu nối uy tín giữa người cần thanh lý và người tìm kiếm sản phẩm chất lượng với giá phải chăng. Chúng tôi tin rằng mọi món đồ cũ đều có giá trị và xứng đáng có một cuộc đời mới.
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
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Kho Bãi & Đội Ngũ</h2>
            <p className="mt-4 text-muted-foreground">
              Kho hàng rộng lớn của chúng tôi tại Hoài Đức là trung tâm xử lý, phân loại và tân trang sản phẩm. Với đội ngũ nhân viên thu mua và kỹ thuật viên lành nghề, chúng tôi đảm bảo mọi sản phẩm bán ra đều được kiểm tra chất lượng. Chúng tôi tự hào là đối tác tin cậy của hàng trăm nhà hàng và doanh nghiệp trên toàn quốc.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg">
                <Link href="/contact">Liên Hệ</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/services/thu-mua">Yêu Cầu Thu Mua</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="https://picsum.photos/seed/factory/800/600" 
              alt="Kho hàng đồ cũ Thiên Tiến" 
              fill 
              className="object-cover"
              data-ai-hint="second-hand warehouse"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
