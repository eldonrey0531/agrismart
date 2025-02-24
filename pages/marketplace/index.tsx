import { marketplaceApi } from '@/lib/shared/services/api-client';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface MarketplaceResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function getMarketplaceProducts(
  search?: string,
  category?: string,
  page: number = 1,
  limit: number = 10
): Promise<MarketplaceResponse> {
  try {
    return await marketplaceApi.get('/products', {
      params: {
        search,
        category,
        page,
        limit,
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
      }
    };
  }
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  // Await the searchParams before using them
  const params = await Promise.resolve(searchParams);
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const category = params.category as string | undefined;
  const search = params.search as string | undefined;

  // Fetch products with error handling
  let products: Product[] = [];
  let pagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  };

  try {
    const response = await getMarketplaceProducts(
      search,
      category,
      page,
      limit
    );
    products = response.products;
    pagination = response.pagination;
  } catch (error) {
    console.error('Error fetching marketplace data:', error);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] relative">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#244A32]/20 via-transparent to-[#172F21]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38FF7E]/5 via-transparent to-transparent" />
      </div>

      {/* Premium Header */}
      <div className="relative border-b border-[#38FF7E]/10 bg-gradient-to-r from-[#0C1410]/95 via-[#0E1B13]/95 to-[#223027]/95 backdrop-blur-md">
        <div className="container py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-[#E3FFED] to-[#38FF7E] bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="mt-3 text-[#E3FFED]/70 text-lg">
                Browse and buy agricultural products from verified sellers
              </p>
            </div>
            <Button className="premium-button w-full md:w-auto text-lg" asChild>
              <a href="/marketplace/create">List an Item</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content with premium styling */}
      <div className="container py-12">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#244A32] to-[#172F21] mb-6 shadow-[0_0_15px_rgba(56,255,126,0.1)]">
              <AlertCircle className="h-8 w-8 text-[#38FF7E]" />
            </div>
            <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-[#E3FFED] to-[#38FF7E] bg-clip-text text-transparent">
              No Products Found
            </h2>
            <p className="text-[#E3FFED]/70 mb-8 max-w-[500px] mx-auto text-lg">
              {search || category
                ? "Try adjusting your search or filters"
                : "Products will appear here once they are listed"}
            </p>
            <Button className="premium-button text-lg" asChild>
              <a href="/marketplace/create">List a Product</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-xl premium-card transition-all duration-300 hover:scale-[1.02]"
              >
                <a href={`/marketplace/products/${product.id}`}>
                  {/* Product content with premium styling */}
                  <div className="aspect-video relative bg-gradient-to-br from-[#244A32]/50 to-[#172F21]/50 backdrop-blur-sm">
                    {/* Image placeholder with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#38FF7E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold truncate text-[#E3FFED] group-hover:text-[#38FF7E] transition-colors duration-300">
                      {product.title}
                    </h3>
                    <p className="mt-2 text-[#E3FFED]/70 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-medium text-[#38FF7E]">
                        ${product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-[#E3FFED]/50">
                        {product.location?.address}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Premium Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-3">
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 text-lg ${
                  page === i + 1 
                    ? 'bg-gradient-to-r from-[#244A32] to-[#172F21] text-[#38FF7E] shadow-[0_0_10px_rgba(56,255,126,0.2)]'
                    : 'text-[#E3FFED]/70 hover:text-[#E3FFED] border-[#38FF7E]/10 hover:border-[#38FF7E]/30'
                }`}
                asChild
              >
                <a
                  href={`/marketplace?page=${i + 1}${
                    search ? `&search=${search}` : ''
                  }${category ? `&category=${category}` : ''}`}
                >
                  {i + 1}
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}