'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  withWordmark?: boolean;
}

export function BrandMark({
  className,
  size = 'md',
  href = '/',
  withWordmark = true,
}: BrandMarkProps) {
  const sizes = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-base' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-lg' },
    lg: { box: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-2xl' },
  } as const;
  const s = sizes[size];

  const inner = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 grid place-items-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10',
          s.box,
        )}
      >
        <Leaf className={cn('text-white', s.icon)} />
      </div>
      {withWordmark && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-bold tracking-tight text-foreground', s.text)}>
            Meal Relay
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground font-medium">
              Food rescue · India
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex">
        {inner}
      </Link>
    );
  }
  return inner;
}
