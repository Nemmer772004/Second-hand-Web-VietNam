import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "Chính sách đổi trả của bạn là gì?",
    answer: "Chúng tôi cung cấp chính sách đổi trả trong 30 ngày cho hầu hết các mặt hàng. Sản phẩm phải ở tình trạng mới, chưa qua sử dụng và còn nguyên bao bì. Một số trường hợp ngoại lệ như đơn hàng tùy chỉnh có thể được áp dụng. Vui lòng truy cập trang giao hàng & đổi trả của chúng tôi để biết chi tiết đầy đủ."
  },
  {
    question: "Giao hàng mất bao lâu?",
    answer: "Thời gian giao hàng thay đổi tùy thuộc vào vị trí của bạn và tình trạng sẵn có của mặt hàng. Các mặt hàng có sẵn tiêu chuẩn thường đến trong vòng 5-10 ngày làm việc. Các mặt hàng tùy chỉnh hoặc đặt trước có thể mất nhiều thời gian hơn. Bạn sẽ nhận được số theo dõi khi đơn hàng của bạn được vận chuyển."
  },
  {
    question: "Bạn có bảo hành cho đồ nội thất của mình không?",
    answer: "Có, tất cả các sản phẩm của chúng tôi đều được bảo hành tối thiểu 1 năm của nhà sản xuất, bao gồm các lỗi về vật liệu và tay nghề. Các sản phẩm cụ thể có thể có thời gian bảo hành dài hơn, sẽ được ghi chú trên trang sản phẩm."
  },
  {
    question: "Tôi có thể tùy chỉnh vải hoặc lớp hoàn thiện trên một món đồ nội thất không?",
    answer: "Nhiều mặt hàng của chúng tôi có thể tùy chỉnh. Hãy tìm tùy chọn 'Tùy chỉnh' trên trang sản phẩm hoặc liên hệ với đội ngũ thiết kế của chúng tôi để thảo luận về các tùy chọn có sẵn cho vải, lớp hoàn thiện và kích thước."
  },
  {
    question: "Bạn có cung cấp dịch vụ thiết kế nội thất không?",
    answer: "Chắc chắn rồi! Đội ngũ nhà thiết kế nội thất chuyên nghiệp của chúng tôi có thể giúp bạn tạo ra không gian hoàn hảo. Chúng tôi cung cấp các dịch vụ từ tư vấn đơn giản đến thiết kế nhà hoàn chỉnh. Hãy truy cập trang Thiết kế Nội thất của chúng tôi để tìm hiểu thêm và đặt lịch tư vấn."
  },
  {
    question: "Bạn chấp nhận những phương thức thanh toán nào?",
    answer: "Chúng tôi chấp nhận tất cả các loại thẻ tín dụng chính (Visa, MasterCard, American Express), cũng như các tùy chọn thanh toán an toàn như PayPal, Zalo Pay và Momo. Chúng tôi cũng cung cấp các tùy chọn tài chính thông qua các đối tác của mình."
  }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Các Câu Hỏi Thường Gặp</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tìm câu trả lời cho các câu hỏi phổ biến về sản phẩm, dịch vụ và chính sách của chúng tôi. Nếu bạn không thể tìm thấy những gì bạn đang tìm kiếm, xin đừng ngần ngại liên hệ với chúng tôi.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
