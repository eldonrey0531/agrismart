'use client';

import { Icons } from '@/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockProducts = [
  {
    id: '1',
    name: 'Organic Rice Seeds',
    category: 'Seeds',
    price: '₱1,200.00',
    unit: 'per kg',
    seller: 'AgriTech Solutions',
    location: 'Nueva Ecija',
    image: null,
  },
  {
    id: '2',
    name: 'Bio-Organic Fertilizer',
    category: 'Fertilizers',
    price: '₱850.00',
    unit: 'per sack',
    seller: 'EcoFarm Supplies',
    location: 'Pampanga',
    image: null,
  },
  {
    id: '3',
    name: 'Irrigation System Kit',
    category: 'Equipment',
    price: '₱15,000.00',
    unit: 'per set',
    seller: 'FarmTech PH',
    location: 'Bulacan',
    image: null,
  },
];

const categories = [
  'All Products',
  'Seeds',
  'Fertilizers',
  'Equipment',
  'Tools',
  'Supplies',
];

export default function MarketplacePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Marketplace</h2>
        <ButtonWrapper variant="default">
          <Icons.add className="mr-2 h-4 w-4" />
          List Product
        </ButtonWrapper>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Icons.search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <ButtonWrapper
                  key={category}
                  variant="outline"
                  size="sm"
                >
                  {category}
                </ButtonWrapper>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
              <Icons.image className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{product.price}</span>
                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icons.user className="h-4 w-4" />
                  {product.seller}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icons.home className="h-4 w-4" />
                  {product.location}
                </div>
                <ButtonWrapper className="w-full mt-4">
                  Contact Seller
                </ButtonWrapper>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
            <CardDescription>
              Current market prices and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Icons.chart className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Market analysis coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
            <CardDescription>
              Most active product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.slice(1).map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <span>{category}</span>
                  <ButtonWrapper variant="ghost" size="sm">
                    View Products
                  </ButtonWrapper>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}