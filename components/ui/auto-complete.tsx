'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface AutoCompleteProps<T> {
  items: T[];
  value?: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  placeholder?: string;
  className?: string;
  getDisplayValue: (item: T) => string;
  getFilterValue?: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  loading?: boolean;
  error?: string;
  maxItems?: number;
}

export function AutoComplete<T>({
  items,
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search...',
  className,
  getDisplayValue,
  getFilterValue = getDisplayValue,
  renderItem,
  loading = false,
  error,
  maxItems = 10,
}: AutoCompleteProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items.slice(0, maxItems);

    return items
      .filter((item) =>
        getFilterValue(item)
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      )
      .slice(0, maxItems);
  }, [items, inputValue, getFilterValue, maxItems]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-background pl-8 pr-4 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-ring',
            error && 'border-destructive focus:ring-destructive'
          )}
        />
      </div>

      {open && (inputValue || filteredItems.length > 0) && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <Command className="w-full">
            <div className="max-h-60 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                      setInputValue(getDisplayValue(item));
                    }}
                    className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-accent"
                  >
                    {renderItem ? (
                      renderItem(item)
                    ) : (
                      <span>{getDisplayValue(item)}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </Command>
        </div>
      )}

      {error && (
        <div className="mt-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

export { Command };