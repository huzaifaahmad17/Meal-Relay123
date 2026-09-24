'use client';

import dynamic from 'next/dynamic';
import { DashboardShell } from '@/components/dashboard-shell';
import { useCurrentUser } from '@/lib/use-demo-store';
import { SiteShell } from '@/components/site-shell';
import { Card, CardContent } from '@/components/ui/card';

// Leaflet uses `window`, so the map must be client-only.
const LiveMap = dynamic(
  () => import('@/components/live-map').then((m) => m.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border bg-muted/40 h-[520px] grid place-items-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
          <div className="text-sm text-muted-foreground">Loading live map…</div>
        </div>
      </div>
    ),
  },
);

export default function MapPage() {
  const { user, ready } = useCurrentUser();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      </div>
    );
  }

  // Public-facing map for unauthenticated visitors
  if (!user) {
    return (
      <SiteShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-600">
              Live impact map
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              See where food is being rescued right now
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Every dot represents a real donor, NGO, volunteer or in-flight donation
              across India. Click any marker to see details.
            </p>
          </div>
          <LiveMap />
        </div>
      </SiteShell>
    );
  }

  return (
    <DashboardShell
      pageTitle="Live impact map"
      pageDescription="Track every donation, NGO and volunteer across the network in real time."
    >
      <LiveMap />
    </DashboardShell>
  );
}
