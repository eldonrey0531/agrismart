import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">AgriSmart</h3>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <p>Connecting farmers and buyers</p>
              <p>Making agriculture smarter</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="/marketplace"
                className="hover:text-primary transition-colors"
              >
                Marketplace
              </Link>
              <Link href="/chat" className="hover:text-primary transition-colors">
                Messages
              </Link>
              <Link
                href="/resources"
                className="hover:text-primary transition-colors"
              >
                Resources
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
              <Link href="/docs" className="hover:text-primary transition-colors">
                Documentation
              </Link>
              <Link href="/help" className="hover:text-primary transition-colors">
                Help Center
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border/40 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AgriSmart. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="https://twitter.com"
                className="text-muted-foreground hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </Link>
              <Link
                href="https://facebook.com"
                className="text-muted-foreground hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-muted-foreground hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;