'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DragDropProps<T> {
  items: T[];
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  onReorder: (items: T[]) => void;
  keyExtractor: (item: T) => string | number;
  className?: string;
  containerClassName?: string;
  dragHandleClassName?: string;
  disabled?: boolean;
}

export function DragDrop<T>({
  items,
  renderItem,
  onReorder,
  keyExtractor,
  className,
  containerClassName,
  dragHandleClassName,
  disabled = false,
}: DragDropProps<T>) {
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    // Add drag styling
    if (e.target instanceof HTMLElement) {
      requestAnimationFrame(() => {
        e.target.style.opacity = '0.5';
      });
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (disabled) return;
    setDraggingIndex(null);
    setDragOverIndex(null);

    // Remove drag styling
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '';
    }
  };

  const handleDragOver = React.useCallback(
    (e: React.DragEvent, index: number) => {
      if (disabled) return;
      e.preventDefault();
      setDragOverIndex(index);

      if (draggingIndex === null) return;

      if (draggingIndex !== index) {
        const newItems = [...items];
        const draggedItem = newItems[draggingIndex];
        newItems.splice(draggingIndex, 1);
        newItems.splice(index, 0, draggedItem);
        onReorder(newItems);
        setDraggingIndex(index);
      }
    },
    [disabled, draggingIndex, items, onReorder]
  );

  const handleDragLeave = () => {
    if (disabled) return;
    setDragOverIndex(null);
  };

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative',
            dragOverIndex === index && 'border-t-2 border-primary',
            className
          )}
        >
          <div
            className={cn(
              'cursor-move select-none',
              disabled && 'cursor-default',
              dragHandleClassName
            )}
          >
            {renderItem(item, draggingIndex === index)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Example usage:
// interface Item {
//   id: string;
//   content: string;
// }
//
// const items: Item[] = [
//   { id: '1', content: 'Item 1' },
//   { id: '2', content: 'Item 2' },
//   { id: '3', content: 'Item 3' },
// ];
//
// return (
//   <DragDrop
//     items={items}
//     renderItem={(item, isDragging) => (
//       <div className={`p-4 bg-white rounded shadow ${isDragging ? 'opacity-50' : ''}`}>
//         {item.content}
//       </div>
//     )}
//     onReorder={setItems}
//     keyExtractor={(item) => item.id}
//   />
// );