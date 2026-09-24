'use client';

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: number; positive?: boolean };
  tone?: 'emerald' | 'teal' | 'amber' | 'indigo' | 'rose' | 'blue';
}

const tones = {
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-700',
    accent: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700',
  },
  teal: {
    iconBg: 'bg-teal-100 text-teal-700',
    accent: 'text-teal-600',
    badge: 'bg-teal-50 text-teal-700',
  },
  amber: {
    iconBg: 'bg-amber-100 text-amber-700',
    accent: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
  },
  indigo: {
    iconBg: 'bg-indigo-100 text-indigo-700',
    accent: 'text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700',
  },
  rose: {
    iconBg: 'bg-rose-100 text-rose-700',
    accent: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700',
  },
  blue: {
    iconBg: 'bg-blue-100 text-blue-700',
    accent: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  tone = 'emerald',
}: StatCardProps) {
  const t = tones[tone];
  return (
    <Card className="border hover:shadow-lg transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'w-10 h-10 rounded-xl grid place-items-center',
              t.iconBg,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5',
                trend.positive !== false
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700',
              )}
            >
              {trend.positive !== false ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
