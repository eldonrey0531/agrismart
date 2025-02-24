'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";
import debounce from 'lodash/debounce';

interface ProductSearchProps {
  defaultValue?: string;
}

export default function ProductSearch({ defaultValue }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      
      // Reset to first page when searching
      params.delete('page');

      startTransition(() => {
        router.push(`/marketplace?${params.toString()}`);
      });
    }, 300),
    [router, searchParams]
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search products..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
        disabled={isPending}
      />
      {isPending && (
        <div className="absolute right-3 top-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}