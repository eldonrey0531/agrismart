'use client';

import { BrandLogo } from '@/components/ui/brand-logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export function AuthLayout({
  children,
  showLogo = true,
  testimonial = {
    quote: "This platform has revolutionized how we manage our agricultural operations. The insights and tools provided are invaluable.",
    author: "Sofia Davis",
    role: "Agricultural Consultant",
  },
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 lg:max-w-none">
      {/* Left Panel - Hidden on mobile */}
      <div className="relative hidden h-full flex-col lg:flex">
        {/* Premium gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#030A06] via-[#0E1B13] to-[#172F21]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#38FF7E]/5 via-transparent to-transparent" />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#244A32]/20 via-transparent to-transparent animate-gradient" />
        </div>

        {/* Content */}
        <div className="relative z-20 p-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center text-lg font-medium">
            {showLogo && (
              <div className="group transition-transform duration-300 hover:scale-105">
                <BrandLogo className="h-8 text-[#38FF7E] drop-shadow-[0_0_8px_rgba(56,255,126,0.5)]" />
              </div>
            )}
          </div>

          {/* Testimonial */}
          <div className="relative z-20 mt-auto">
            <div className="relative">
              {/* Testimonial decoration */}
              <div className="absolute -left-8 -top-8 text-[120px] font-serif text-[#38FF7E]/10 select-none">
                "
              </div>
              
              <blockquote className="space-y-4">
                <p className="text-xl leading-relaxed text-[#E3FFED]/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  {testimonial.quote}
                </p>
                <footer className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#244A32] to-[#172F21] flex items-center justify-center">
                    <span className="text-lg font-semibold text-[#38FF7E]">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-[#E3FFED] font-medium">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-[#E3FFED]/70">
                      {testimonial.role}
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="relative flex items-center justify-center p-8">
        {/* Premium background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#030A06] to-[#0E1B13]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38FF7E]/5 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Mobile logo */}
          {showLogo && (
            <div className="flex flex-col items-center space-y-2 lg:hidden">
              <div className="group transition-transform duration-300 hover:scale-105">
                <BrandLogo className="h-8 text-[#38FF7E] drop-shadow-[0_0_8px_rgba(56,255,126,0.5)]" />
              </div>
            </div>
          )}

          {/* Main Content */}
          {children}

          {/* Terms and Privacy Links */}
          <p className="px-8 text-center text-sm text-[#E3FFED]/50">
            By clicking continue, you agree to our{' '}
            <a
              href="/terms"
              className="text-[#38FF7E]/80 hover:text-[#38FF7E] transition-colors underline underline-offset-4"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="text-[#38FF7E]/80 hover:text-[#38FF7E] transition-colors underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}