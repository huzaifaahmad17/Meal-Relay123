'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Phone,
  Heart,
  Users,
  Star,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/use-demo-store';
import { getUsersByRole } from '@/lib/demo-store';
import { cn } from '@/lib/utils';

export default function AdminNgosPage() {
  return (
    <DashboardShell
      requiredRole="admin"
      pageTitle="NGO partners"
      pageDescription="Verified NGOs in the rescue network."
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const ngos = useDemoStore(() => getUsersByRole('ngo'), []);

  const totals = {
    capacity: ngos.reduce((a, n) => a + (n.capacity || 0), 0),
    meals: ngos.reduce((a, n) => a + n.stats.mealsProvided, 0),
    cities: new Set(ngos.map((n) => n.city)).size,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="Total NGOs" value={ngos.length} />
        <Tile label="Daily capacity" value={totals.capacity.toLocaleString('en-IN') + ' meals'} />
        <Tile label="Meals served" value={totals.meals.toLocaleString('en-IN')} />
        <Tile label="Cities" value={totals.cities} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ngos.map((n) => (
          <Card key={n.id} className="border hover:shadow-lg transition-all">
            <CardContent className="pt-5">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl bg-gradient-to-br grid place-items-center text-white font-bold',
                    n.avatarColor,
                  )}
                >
                  {n.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{n.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {n.address.area}, {n.city}
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] flex-shrink-0">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Mini icon={Users} label="Capacity" value={n.capacity || 0} />
                    <Mini icon={Heart} label="Meals" value={n.stats.mealsProvided} />
                    <Mini icon={Star} label="Rating" value={n.rating} />
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {(n.servingAreas || []).slice(0, 4).map((area) => (
                      <Badge key={area} variant="outline" className="text-[10px]">
                        {area}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                      <Link href="/chat">Message</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                      <a href={`tel:${n.phone}`}>
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border">
      <CardContent className="pt-5 pb-5">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="w-3 h-3" />
        <span className="text-[9px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-sm font-bold mt-0.5">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </div>
    </div>
  );
}
