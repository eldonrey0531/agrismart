import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Header } from '@/components/layout/header';
import { Providers } from '@/app/providers';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AgriSmart',
    template: '%s | AgriSmart',
  },
  description: 'Agricultural Management Platform',
  keywords: [
    'agriculture',
    'farm management',
    'marketplace',
    'community',
    'resources',
  ],
  authors: [
    {
      name: 'AgriSmart',
      url: 'https://agrismart.com',
    },
  ],
  creator: 'AgriSmart',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

/**
 * Public pages that don't require authentication
 */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/resources',
  '/about',
  '/contact',
];

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Get current path from headers
  const headersList = await headers();
  const path = headersList.get('x-invoke-path') || '/';
  const isPublicPath = PUBLIC_PATHS.some(p => path.startsWith(p));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            {!isPublicPath && (
              <footer className="border-t py-4">
                <div className="container flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} AgriSmart. All rights reserved.
                  </p>
                  <nav className="flex items-center space-x-4">
                    <a 
                      href="/privacy"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Privacy
                    </a>
                    <a 
                      href="/terms"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Terms
                    </a>
                    <a 
                      href="/support"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Support
                    </a>
                  </nav>
                </div>
              </footer>
            )}
          </div>
        </Providers>
      </body>
    </html>
  );
}
