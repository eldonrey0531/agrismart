"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  count?: number;
}

interface CategoryListProps {
  title?: string;
  categories: Category[];
  onSelect?: (category: string | null) => void;
  selectedCategory?: string | null;
  showFilterButton?: boolean;
  className?: string;
  variant?: "default" | "pills";
}

export function CategoryList({
  title = "Categories",
  categories,
  onSelect,
  selectedCategory,
  showFilterButton = false,
  className,
  variant = "default",
}: CategoryListProps) {
  const [localSelectedCategory, setLocalSelectedCategory] = useState<string | null>(
    selectedCategory || null
  );

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = localSelectedCategory === categoryId ? null : categoryId;
    setLocalSelectedCategory(newCategory);
    onSelect?.(newCategory);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {showFilterButton && (
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        )}
      </div>
      <div className={cn(
        "flex gap-2",
        variant === "pills" ? "flex-wrap" : "flex-col"
      )}>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={variant === "pills" ? "outline" : "ghost"}
            size="sm"
            className={cn(
              variant === "pills" 
                ? "rounded-full" 
                : "justify-between w-full",
              localSelectedCategory === category.id && (
                variant === "pills" 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted"
              )
            )}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span>{category.name}</span>
            {category.count !== undefined && (
              <span className={cn(
                "ml-2 text-xs",
                variant === "pills" 
                  ? "bg-muted rounded-full px-2 py-0.5"
                  : "text-muted-foreground"
              )}>
                {category.count}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}