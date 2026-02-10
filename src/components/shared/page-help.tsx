'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PageHelpProps {
  title: string;
  description: string;
  helpHref: string;
}

export function PageHelp({ title, description, helpHref }: PageHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label={`Ajuda: ${title}`}
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Link href={helpHref} onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full">
              Ver documentacao completa <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}
