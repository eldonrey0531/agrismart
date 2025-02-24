import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace - Agriculture Hub',
  description: 'Browse and buy agricultural products from verified sellers',
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {/* Optional: Add shared marketplace elements like navigation, cart status, etc. */}
      <div className="min-h-screen bg-background">
        {children}
      </div>

      {/* Optional: Add marketplace-specific footer with categories, about, etc. */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Seeds</li>
                <li>Tools</li>
                <li>Equipment</li>
                <li>Fertilizers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Sellers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Become a Seller</li>
                <li>Success Stories</li>
                <li>Guidelines</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Help & Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>FAQs</li>
                <li>Shipping Info</li>
                <li>Returns</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Our Story</li>
                <li>Community</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}