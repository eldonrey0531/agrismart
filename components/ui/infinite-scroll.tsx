'use client';

import * as React from 'react';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  className?: string;
  loaderClassName?: string;
  disabled?: boolean;
  threshold?: number;
  renderLoader?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading = false,
  className,
  loaderClassName,
  disabled = false,
  threshold = 100,
  renderLoader,
  renderEmpty,
  keyExtractor = (_, index) => index,
}: InfiniteScrollProps<T>) {
  const { targetRef, isLoading } = useInfiniteScroll({
    onLoadMore,
    disabled: disabled || !hasMore || loading,
    threshold,
  });

  if (items.length === 0 && !loading) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="py-8 text-center text-muted-foreground">
        No items to display
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
      <div
        ref={targetRef}
        className={cn(
          'py-4 text-center text-sm text-muted-foreground',
          loaderClassName
        )}
      >
        {(isLoading || loading) &&
          (renderLoader ? (
            renderLoader()
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading more items...</span>
            </div>
          ))}
        {!hasMore && !isLoading && items.length > 0 && (
          <span>No more items to load</span>
        )}
      </div>
    </div>
  );
}

// Example usage:
// const items = [...];
//
// return (
//   <InfiniteScroll
//     items={items}
//     renderItem={(item, index) => (
//       <div key={index} className="p-4 border-b">
//         {item.content}
//       </div>
//     )}
//     onLoadMore={loadMore}
//     hasMore={hasMore}
//     loading={loading}
//     keyExtractor={(item) => item.id}
//   />
// );