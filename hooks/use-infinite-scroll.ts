import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  onLoadMore: () => Promise<void>;
  disabled?: boolean;
}

export function useInfiniteScroll({
  threshold = 100,
  onLoadMore,
  disabled = false,
}: UseInfiniteScrollOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    const loadMoreItems = async () => {
      if (loadingRef.current) return;

      try {
        loadingRef.current = true;
        setIsLoading(true);
        await onLoadMore();
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMoreItems();
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, onLoadMore, disabled]);

  useEffect(() => {
    const observer = observerRef.current;
    const target = targetRef.current;

    if (observer && target) {
      observer.observe(target);
    }

    return () => {
      if (observer && target) {
        observer.unobserve(target);
      }
    };
  }, []);

  return {
    targetRef,
    isLoading,
  };
}

// Example usage:
// const MyComponent = () => {
//   const [items, setItems] = useState<Item[]>([]);
//   const [hasMore, setHasMore] = useState(true);
//
//   const loadMore = async () => {
//     const newItems = await fetchMoreItems();
//     setItems(prev => [...prev, ...newItems]);
//     setHasMore(newItems.length > 0);
//   };
//
//   const { targetRef, isLoading } = useInfiniteScroll({
//     onLoadMore: loadMore,
//     disabled: !hasMore,
//   });
//
//   return (
//     <div>
//       {items.map(item => (
//         <div key={item.id}>{item.content}</div>
//       ))}
//       <div ref={targetRef}>
//         {isLoading ? 'Loading...' : hasMore ? '' : 'No more items'}
//       </div>
//     </div>
//   );
// };