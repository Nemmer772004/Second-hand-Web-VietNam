import { Truck, Package, Calendar, Shield } from 'lucide-react';

export default function DeliveryPage() {
  const deliveryInfo = [
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Giao Hàng Tiêu Chuẩn",
      description: "Phục vụ toàn quốc. Đơn hàng của bạn thường sẽ đến trong vòng 5-10 ngày làm việc đối với các mặt hàng có sẵn. Miễn phí giao hàng cho tất cả các đơn hàng trên 500.000đ trong nội thành. Áp dụng phí cố định cho các khu vực khác."
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "Dịch Vụ Giao Hàng Cao Cấp",
      description: "Dịch vụ giao hàng cao cấp của chúng tôi bao gồm đặt hàng tại phòng bạn chọn, lắp ráp hoàn chỉnh và dọn dẹp tất cả các vật liệu đóng gói. Hãy để đội ngũ chuyên nghiệp của chúng tôi lo liệu mọi thứ cho bạn. Có sẵn tại các khu vực đô thị được chọn."
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Giao Hàng Theo Lịch Hẹn",
      description: "Khi đơn hàng của bạn đã sẵn sàng, đối tác giao hàng của chúng tôi sẽ liên hệ với bạn để lên lịch giao hàng thuận tiện. Bạn có thể chọn ngày và giờ phù hợp nhất, đảm bảo bạn có mặt ở nhà để nhận đồ nội thất mới của mình."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Đổi & Trả Hàng",
      description: "Chúng tôi muốn bạn yêu thích sản phẩm của mình. Nếu bạn không hoàn toàn hài lòng, chúng tôi cung cấp chính sách đổi trả trong vòng 30 ngày cho hầu hết các mặt hàng. Vui lòng đảm bảo sản phẩm ở trong tình trạng ban đầu. Để biết chi tiết đầy đủ hoặc để bắt đầu quy trình đổi trả, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Giao Hàng & Đổi Trả</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Chúng tôi cam kết cung cấp trải nghiệm giao hàng chuyên nghiệp và liền mạch, đảm bảo đồ nội thất mới của bạn đến nơi an toàn và đúng giờ.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {deliveryInfo.map((info, index) => (
          <div key={index} className="flex gap-6">
            <div className="flex-shrink-0">
              {info.icon}
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold">{info.title}</h3>
              <p className="mt-2 text-muted-foreground">{info.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center bg-secondary p-12 rounded-lg">
          <h2 className="font-headline text-3xl font-bold">Bạn có thêm câu hỏi?</h2>
          <p className="mt-2 text-muted-foreground">Đội ngũ hỗ trợ của chúng tôi rất sẵn lòng giúp đỡ với bất kỳ thắc mắc nào liên quan đến vận chuyển, giao hàng hoặc đổi trả.</p>
          <a href="/contact" className="inline-block mt-6 bg-primary text-primary-foreground py-3 px-8 rounded-md text-lg font-medium transition-transform hover:scale-105">
            Liên Hệ Hỗ Trợ
          </a>
      </div>
    </div>
  );
}
