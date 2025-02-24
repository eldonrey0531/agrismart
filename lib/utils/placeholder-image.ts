/**
 * Generate a placeholder image URL using placeholdAPIs
 * with consistent colors and patterns for each product
 */
export function generatePlaceholderImage(id: string, width = 600, height = 400): string {
  // Create a deterministic color based on the id
  const hash = id.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Generate two colors for background and text
  const bgColor = `${Math.abs(hash) % 255},${Math.abs(hash * 2) % 255},${Math.abs(hash * 3) % 255}`;
  const textColor = `${Math.abs(hash * 4) % 255},${Math.abs(hash * 5) % 255},${Math.abs(hash * 6) % 255}`;
  
  const text = `Product ${id}`;
  
  // Use a placeholder image service
  return `https://placehold.co/${width}x${height}/rgb(${bgColor})/rgb(${textColor})?text=${encodeURIComponent(text)}`;
}

/**
 * Update mock product data with placeholder images if none exist
 */
export function ensureProductImages(product: { id: string; images: string[] }): string[] {
  if (product.images.length === 0 || product.images.every(img => !img || img.startsWith('/'))) {
    // Generate multiple placeholder images with different dimensions
    return [
      generatePlaceholderImage(product.id, 600, 400),
      generatePlaceholderImage(product.id + '-2', 600, 400),
      generatePlaceholderImage(product.id + '-3', 400, 400),
    ];
  }
  
  // Return original images if they exist and are valid URLs
  return product.images;
}

/**
 * Generate a product thumbnail
 */
export function generateThumbnail(id: string): string {
  return generatePlaceholderImage(id, 200, 200);
}

/**
 * Check if an image URL is a placeholder
 */
export function isPlaceholderImage(url: string): boolean {
  return url.startsWith('https://placehold.co/');
}

/**
 * Get a blurred data URL for image loading placeholder
 */
export function getBlurDataURL(): string {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRsdHSIeIR0hIyEiISMhISMmIyYjJiMmJiYmJiYtLS0tLS4uLi4uLi4uLi4uLi7/2wBDARAVFhYgHSAdIB0gLiAdIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAABAwIGAwAAAAAAAAAAAAABAAIDBAUREhMUITEyQf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AoNxstNTyU0FRDI5oLX6g5yd4IOD1zzzwoFtiggu9award3yUssgkiY/YSMa8jkE4HPRwCOxwrtEJGYBHBxgL0XZ2/Q4QhYYRQvZ//2Q==';
}