import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-[280px]">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Button asChild className="mt-4">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
