import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  className?: string;
  date?: DateRange;
  onSelect?: (date: DateRange | undefined) => void;
}

/**
 * Date range picker component
 */
export function CalendarDateRangePicker({
  className,
  date,
  onSelect,
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(
    date
  );

  // Handle date selection
  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    onSelect?.(range);
  };

  // Format date range for display
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return 'Select date range';
    }

    if (!range.to) {
      return format(range.from, 'LLL dd, y');
    }

    return `${format(range.from, 'LLL dd, y')} - ${format(
      range.to,
      'LLL dd, y'
    )}`;
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            size="sm"
            className={cn(
              'justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(selectedRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="grid grid-cols-2 gap-2 p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                handleSelect({
                  from: today,
                  to: today,
                });
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                handleSelect({
                  from: addDays(today, -7),
                  to: today,
                });
              }}
            >
              Last 7 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                handleSelect({
                  from: addDays(today, -30),
                  to: today,
                });
              }}
            >
              Last 30 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelect(undefined)}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}