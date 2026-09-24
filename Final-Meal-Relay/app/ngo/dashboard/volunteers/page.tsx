'use client';

import { useState, useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Truck,
  Phone,
  MessageSquare,
  Star,
  MapPin,
  Bike,
  Car,
} from 'lucide-react';
import { useDemoStore } from '@/lib/use-demo-store';
import { getDonationsByVolunteer, getUsersByRole } from '@/lib/demo-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NgoVolunteersPage() {
  return (
    <DashboardShell
      requiredRole="ngo"
      pageTitle="Volunteer roster"
      pageDescription="Trained and verified volunteers ready to pick up donations."
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const volunteers = useDemoStore(() => getUsersByRole('volunteer'), []);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (vehicleFilter !== 'all' && v.vehicleType !== vehicleFilter) return false;
      if (
        search &&
        !`${v.name} ${v.city} ${v.address.area}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [volunteers, search, vehicleFilter]);

  const onlineCount = volunteers.filter((v) => v.online).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total volunteers" value={volunteers.length} />
        <StatTile label="Online now" value={onlineCount} accent="emerald" />
        <StatTile
          label="Avg rating"
          value={`${(volunteers.reduce((a, v) => a + v.rating, 0) / Math.max(volunteers.length, 1)).toFixed(1)} ★`}
        />
        <StatTile
          label="Total deliveries"
          value={volunteers
            .reduce((a, v) => a + v.stats.totalDonations, 0)
            .toLocaleString('en-IN')}
        />
      </div>

      <Card className="border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, area…"
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {['all', 'bicycle', 'motorcycle', 'car', 'van'].map((v) => (
                <button
                  key={v}
                  onClick={() => setVehicleFilter(v)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all',
                    vehicleFilter === v
                      ? 'bg-background shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <VolunteerCard key={v.id} volunteer={v} />
        ))}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'emerald';
}) {
  return (
    <Card className="border">
      <CardContent className="pt-5 pb-5">
        <div className={cn('text-2xl font-bold', accent === 'emerald' && 'text-emerald-600')}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function VolunteerCard({ volunteer }: { volunteer: any }) {
  const tasks = useDemoStore(() => getDonationsByVolunteer(volunteer.id), []);
  const active = tasks.filter((t) =>
    ['assigned', 'picked-up', 'in-transit'].includes(t.status),
  ).length;
  return (
    <Card className="border hover:shadow-lg transition-all">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  'w-12 h-12 rounded-full bg-gradient-to-br grid place-items-center text-white font-semibold',
                  volunteer.avatarColor,
                )}
              >
                {volunteer.initials}
              </div>
              {volunteer.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              )}
            </div>
            <div>
              <div className="font-bold">{volunteer.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {volunteer.vehicleType} · {volunteer.city}
              </div>
            </div>
          </div>
          <Badge
            className={cn(
              'text-[10px]',
              volunteer.online
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {volunteer.online ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Rating" value={`${volunteer.rating}★`} />
          <Stat label="Deliveries" value={volunteer.stats.totalDonations} />
          <Stat label="Active" value={active} />
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-3">
          <MapPin className="w-3 h-3" />
          {volunteer.address.area}
        </div>

        <div className="flex gap-1.5 mt-4">
          <Button asChild size="sm" variant="outline" className="flex-1 h-8 text-xs">
            <Link href="/chat">
              <MessageSquare className="w-3 h-3 mr-1" />
              Chat
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1 h-8 text-xs">
            <a href={`tel:${volunteer.phone}`}>
              <Phone className="w-3 h-3 mr-1" />
              Call
            </a>
          </Button>
          <Button size="sm" className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
            <Truck className="w-3 h-3 mr-1" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-muted/50 py-1.5">
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
