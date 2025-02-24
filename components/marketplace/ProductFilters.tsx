'use client';

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const categories = [
  "seeds",
  "tools",
  "equipment",
  "fertilizers",
  "pesticides",
  "others",
] as const;

type Category = (typeof categories)[number];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') as Category | null;
  const currentMinPrice = Number(searchParams.get('minPrice')) || 0;
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || 1000;

  const handleFilter = (type: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null) {
      params.delete(type);
    } else {
      params.set(type, value.toString());
    }
    
    // Reset to first page when filtering
    params.delete('page');

    startTransition(() => {
      router.push(`/marketplace?${params.toString()}`);
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Category</h3>
            <Select
              value={currentCategory ?? ''}
              onValueChange={(value: string) => handleFilter('category', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Price Range</h3>
            <div className="pt-2">
              <Slider
                value={[currentMinPrice, currentMaxPrice]}
                min={0}
                max={1000}
                step={10}
                onValueChange={(values) => {
                  handleFilter('minPrice', values[0]);
                  handleFilter('maxPrice', values[1]);
                }}
                disabled={isPending}
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">
                  ${currentMinPrice}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${currentMaxPrice}
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => {
              handleFilter('category', null);
              handleFilter('minPrice', null);
              handleFilter('maxPrice', null);
            }}
            disabled={isPending}
          >
            Reset Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}