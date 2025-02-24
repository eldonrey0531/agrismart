interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const testimonials: Record<string, Testimonial> = {
  login: {
    quote: "This platform has revolutionized how we manage our agricultural operations. The insights and tools provided are invaluable.",
    author: "Sofia Davis",
    role: "Agricultural Consultant",
  },
  signup: {
    quote: "Joining AgriSmart was one of the best decisions for our farm. The platform's features have greatly improved our productivity.",
    author: "Marcus Chen",
    role: "Farm Operations Manager",
  },
  default: {
    quote: "AgriSmart Platform helps us make data-driven decisions that have significantly improved our yields and efficiency.",
    author: "Elena Rodriguez",
    role: "Agricultural Technologist",
  },
};

export function getTestimonial(page: keyof typeof testimonials = 'default'): Testimonial {
  return testimonials[page] || testimonials.default;
}