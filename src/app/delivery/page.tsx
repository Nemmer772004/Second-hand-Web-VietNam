import { Truck, Package, Calendar, Shield } from 'lucide-react';

export default function DeliveryPage() {
  const deliveryInfo = [
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Standard Delivery",
      description: "Available nationwide. Your order will typically arrive within 5-10 business days for in-stock items. Delivery is free for all orders over $50 within city limits. A flat rate applies for other areas."
    },
    {
      icon: <Package className="h-10 w-10 text-primary" />,
      title: "White Glove Service",
      description: "Our premium delivery service includes room-of-choice placement, complete assembly, and removal of all packaging materials. Let our professional team handle everything for you. Available in select metropolitan areas."
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Scheduled Delivery",
      description: "Once your order is ready, our delivery partner will contact you to schedule a convenient delivery window. You can choose a date and time that works best for you, ensuring you're home to receive your new furniture."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Returns & Exchanges",
      description: "We want you to love your purchase. If you're not completely satisfied, we offer a 30-day return policy on most items. Please ensure items are in their original condition. For full details or to initiate a return, contact our support team."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Delivery & Returns</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We are committed to providing a seamless and professional delivery experience, ensuring your new furniture arrives safely and on time.
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
          <h2 className="font-headline text-3xl font-bold">Have More Questions?</h2>
          <p className="mt-2 text-muted-foreground">Our support team is happy to help with any inquiries regarding shipping, delivery, or returns.</p>
          <a href="/contact" className="inline-block mt-6 bg-primary text-primary-foreground py-3 px-8 rounded-md text-lg font-medium transition-transform hover:scale-105">
            Contact Support
          </a>
      </div>
    </div>
  );
}
