import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = 'Back' }: BackButtonProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="gap-2"
    >
      <Link href={href}>
        <ChevronLeft className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}