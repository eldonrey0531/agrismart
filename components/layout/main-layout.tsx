import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Footer } from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Hide header on specific pages
   */
  hideHeader?: boolean;
  /**
   * Hide footer on specific pages
   */
  hideFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  hideHeader = false,
  hideFooter = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && <Header />}
      <main className={cn('flex-1 container mx-auto px-4 py-6', className)}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;