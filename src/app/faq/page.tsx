import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy on most items. Products must be in new, unused condition with original packaging. Some exclusions, like custom orders, may apply. Please visit our delivery & returns page for full details."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery times vary based on your location and item availability. Standard in-stock items typically arrive within 5-10 business days. Custom or backordered items may take longer. You will receive a tracking number once your order ships."
  },
  {
    question: "Do you offer a warranty on your furniture?",
    answer: "Yes, all our products come with a minimum 1-year manufacturer's warranty covering defects in materials and workmanship. Specific products may have longer warranty periods, which will be noted on the product page."
  },
  {
    question: "Can I customize the fabric or finish on a piece of furniture?",
    answer: "Many of our items are customizable. Look for the 'Customize' option on the product page or contact our design team to discuss available options for fabrics, finishes, and dimensions."
  },
  {
    question: "Do you offer interior design services?",
    answer: "Absolutely! Our team of professional interior designers can help you create the perfect space. We offer services ranging from a simple consultation to a full home design. Visit our Interior Design page to learn more and book a consultation."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), as well as secure payment options like PayPal, Zalo Pay, and Momo. We also offer financing options through our partners."
  }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about our products, services, and policies. If you can't find what you're looking for, please don't hesitate to contact us.
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
