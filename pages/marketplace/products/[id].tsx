import { marketplaceApi } from "@/lib/shared/services/api-client";
import { Product } from "@/types/product";
import { ImageFallbackGroup } from "@/components/ui/image-fallback";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Share2, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useScaleAnimation } from "@/hooks/use-animation-system";

interface ProductPageProps {
  params: { id: string };
}

async function getProductDetails(id: string) {
  try {
    return await marketplaceApi.get<{
      product: Product;
      similarProducts: Product[];
    }>(`/products/${id}`);
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { product, similarProducts } = await getProductDetails(params.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb header */}
      <div className="border-b">
        <div className="container max-w-[1200px] py-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-[1200px] py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg">
              <ImageFallbackGroup
                images={product.images}
                fill
                className="rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {product.title}
              </h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-medium">{product.likes}</span>
                  <span className="text-muted-foreground">likes</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground capitalize">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(product.price)}
              </span>
              {product.price > 100 && (
                <span className="text-sm text-muted-foreground">
                  or 4 interest-free payments of {formatCurrency(product.price / 4)}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">About this product</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Seller Information</h3>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{product.seller.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.location.address}
                  </p>
                </div>
                {product.seller.verified && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Verified Seller
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
              <Button size="icon" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Similar Products
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((similarProduct) => (
                <Link
                  key={similarProduct.id}
                  href={`/marketplace/products/${similarProduct.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden h-full transition-colors hover:bg-muted/50">
                    <div className="aspect-square relative">
                      <ImageFallbackGroup
                        images={similarProduct.images}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-1 mb-2">
                        {similarProduct.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {formatCurrency(similarProduct.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm">{similarProduct.likes}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}