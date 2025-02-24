"use client";

import { useIntersection } from "@/hooks/use-intersection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sprout, LeafyGreen, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How does AgriSmart's IoT sensor system work?",
    answer: "AgriSmart uses advanced IoT sensors to monitor key agricultural metrics like soil moisture, temperature, and nutrient levels in real-time. The sensors wirelessly transmit data to our cloud platform, where it's analyzed to provide actionable insights for optimal farming decisions."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer multiple levels of support, including email, priority, and 24/7 dedicated support based on your plan. Our agricultural experts are available to help with technical issues, provide guidance on implementing sustainable practices, and optimize your farming operations."
  },
  {
    question: "Can I integrate AgriSmart with my existing systems?",
    answer: "Yes! AgriSmart is designed to be highly integrable. Our API and custom integration options allow you to connect with existing farm management systems, weather stations, irrigation systems, and other agricultural tools you may already be using."
  },
  {
    question: "How does the sustainable farming feature work?",
    answer: "Our sustainable farming features use AI and machine learning to analyze your farm's data and provide recommendations for resource optimization. This includes smart irrigation scheduling, optimal nutrient management, and pest control strategies that minimize environmental impact."
  },
  {
    question: "Is my farm data secure?",
    answer: "Absolutely. We employ enterprise-grade encryption and security measures to protect your data. All information is stored in secure, compliant cloud infrastructure with regular backups. You maintain full control over your data and who can access it."
  },
  {
    question: "Can I try AgriSmart before committing?",
    answer: "Yes, we offer a 30-day free trial that includes all features of our Growth plan. This allows you to experience the full potential of our platform and see how it can benefit your farming operations before making a decision."
  },
];

export function FAQSection() {
  const [sectionRef, isInView] = useIntersection<HTMLElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden"
    >
      {/* Natural Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Overlays */}
        <div className="absolute top-0 right-0 w-1/3 h-2/3 bg-gradient-to-bl from-accent/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-success/5 to-transparent" />
        
        {/* Decorative Elements */}
        <LeafyGreen 
          className={cn(
            "absolute top-12 right-12 w-8 h-8 text-accent/20 transition-all duration-1000",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          )}
        />
        <Sprout 
          className={cn(
            "absolute bottom-12 left-12 w-8 h-8 text-success/20 transition-all duration-1000",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        />
      </div>

      <div className="container px-4 relative">
        {/* Section Header */}
        <div 
          className={cn(
            "text-center max-w-2xl mx-auto mb-16 transition-all duration-700",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
            Frequently Asked
            <span className="text-gradient bg-gradient-to-r from-accent to-success ml-2">
              Questions
            </span>
          </h2>
          <p className="text-muted-text text-lg">
            Find answers to common questions about AgriSmart's features, security,
            and how we can help transform your farming operations.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div 
          className={cn(
            "max-w-3xl mx-auto transition-all duration-700 delay-200",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border"
              >
                <AccordionTrigger className="hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-text">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Support CTA */}
        <div 
          className={cn(
            "mt-12 text-center transition-all duration-700 delay-400",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-muted-text mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild variant="outline" className="group">
              <Link href="/contact">
                <MessageSquare className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="ghost" className="group">
              <Link href="/docs">
                <HelpCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                View Documentation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;