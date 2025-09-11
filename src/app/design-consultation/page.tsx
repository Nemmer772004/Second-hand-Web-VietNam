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
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  email: z.string().email('Please enter a valid email address.'),
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
        title: 'Consultation Booked!',
        description: 'Thank you! Our design team will contact you shortly to schedule your appointment.',
        });
        form.reset();
    };
    
    const processSteps = [
        { number: '01', title: 'Consultation & Survey', description: 'We start by understanding your vision, needs, and budget, followed by a detailed site survey.' },
        { number: '02', title: 'Concept & 3D Design', description: 'Our designers create a tailored concept with realistic 3D renderings for your approval.' },
        { number: '03', title: 'Production & Sourcing', description: 'We manufacture custom pieces and source the finest materials and decor items.' },
        { number: '04', title: 'Installation & Staging', description: 'Our professional team handles delivery, assembly, and final staging to perfection.' },
        { number: '05', title: 'Handover & Warranty', description: 'We walk you through your new space and provide a comprehensive warranty for peace of mind.' },
    ];
    
    const designers = [
        { name: 'Alice Johnson', role: 'Lead Designer', image: 'https://picsum.photos/seed/d1/400/400' },
        { name: 'Ben Carter', role: 'Senior Designer', image: 'https://picsum.photos/seed/d2/400/400' },
        { name: 'Clara Williams', role: 'Project Manager', image: 'https://picsum.photos/seed/d3/400/400' },
    ];
    
    const projects = [
        { title: 'Modern Apartment', image: 'https://picsum.photos/seed/proj1/600/800', hint: 'modern apartment' },
        { title: 'Luxury Villa', image: 'https://picsum.photos/seed/proj2/600/800', hint: 'luxury villa' },
        { title: 'Cozy Townhouse', image: 'https://picsum.photos/seed/proj3/600/800', hint: 'cozy townhouse' },
    ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[60vh] min-h-[400px] rounded-lg overflow-hidden">
                <Image src="https://picsum.photos/seed/designhero/800/1000" alt="Professional Interior Design" fill className="object-cover" data-ai-hint="interior design sketch" />
            </div>
            <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Professional Interior Design</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Transform your space with the help of our expert designers. We offer a personalized service to create a home that is uniquely yours, blending style, comfort, and functionality.
                </p>
                <div className='mt-6 space-y-2'>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>3D Visualization:</strong> See your design before we build.</p>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>Personalized Style:</strong> Tailored to your taste and lifestyle.</p>
                    <p className='flex items-center gap-2'><Check className='text-primary h-5 w-5' /> <strong>End-to-End Service:</strong> From concept to final installation.</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 p-6 bg-secondary rounded-lg space-y-4">
                        <h3 className="font-headline text-xl font-bold">Book a Free Consultation</h3>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="Your Phone Number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Your Email" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Request Consultation</Button>
                    </form>
                </Form>
            </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Design Process</h2>
            <p className="mt-2 text-lg text-muted-foreground">A clear and collaborative 5-step journey to your dream home.</p>
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
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Showcased Projects</h2>
            <p className="mt-2 text-lg text-muted-foreground">Get inspired by some of our favorite transformations.</p>
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
