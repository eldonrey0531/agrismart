'use client';

import { Product } from '@/types/product';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import { ImageFallbackGroup } from "@/components/ui/image-fallback";
import Link from 'next/link';

interface ProductListProps {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductList({ products, pagination }: ProductListProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group">
            <Link href={`/marketplace/products/${product.id}`}>
              <div className="aspect-video">
                <ImageFallbackGroup
                  images={product.images}
                  fill
                  className="rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">
                      {product.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {product.seller.name}
                      </p>
                      {product.seller.verified && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">
                      {product.likes}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Link>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                {product.location.address}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="font-semibold">
                {formatCurrency(product.price)}
              </div>
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set('page', String(pagination.page - 1));
              window.location.search = searchParams.toString();
            }}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={pagination.page === i + 1 ? "default" : "outline"}
                onClick={() => {
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.set('page', String(i + 1));
                  window.location.search = searchParams.toString();
                }}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set('page', String(pagination.page + 1));
              window.location.search = searchParams.toString();
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}