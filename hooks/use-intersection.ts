import { useState, useEffect, useRef, RefObject } from "react";

interface UseIntersectionOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersection<T extends Element = Element>({
  threshold = 0,
  root = null,
  rootMargin = "0px",
  triggerOnce = false,
}: UseIntersectionOptions = {}): [RefObject<T>, boolean] {
  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip if already triggered and triggerOnce is true
    if (triggerOnce && isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        // Unobserve if triggerOnce is true and element is intersecting
        if (triggerOnce && entry.isIntersecting) {
          observer.unobserve(element);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, root, rootMargin, triggerOnce, isIntersecting]);

  return [elementRef, isIntersecting];
}

export default useIntersection;