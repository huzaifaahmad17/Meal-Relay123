'use client';

import Link from 'next/link';
import { Brain, Sparkles, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSmartInsights } from '@/lib/ai';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AiInsightsProps {
  role: UserRole;
}

export function AiInsights({ role }: AiInsightsProps) {
  const insights = getSmartInsights(role);

  return (
    <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-teal-50/30 dark:from-emerald-950/10 dark:to-teal-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white">
            <Brain className="w-4 h-4" />
          </div>
          AI insights
          <Badge className="bg-emerald-600 text-white text-[10px] ml-auto">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((i) => {
          const Icon =
            i.tone === 'warning'
              ? AlertTriangle
              : i.tone === 'positive'
              ? TrendingUp
              : Sparkles;
          const tones = {
            positive: 'text-emerald-700 bg-emerald-100',
            warning: 'text-amber-700 bg-amber-100',
            neutral: 'text-blue-700 bg-blue-100',
          } as const;
          return (
            <div
              key={i.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-background border hover:border-emerald-300 transition-all"
            >
              <div className={cn('w-8 h-8 rounded-lg grid place-items-center flex-shrink-0', tones[i.tone])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{i.title}</div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {i.description}
                </p>
                {i.action && (
                  <Link
                    href={i.action.href}
                    className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-0.5 mt-2"
                  >
                    {i.action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
