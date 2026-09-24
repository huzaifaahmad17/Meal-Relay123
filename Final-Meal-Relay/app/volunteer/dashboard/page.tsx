'use client';

import Link from 'next/link';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Star,
  Zap,
  Navigation,
  Award,
  Route,
  Phone,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import {
  getDonationsByVolunteer,
  getPendingDonations,
  getUserById,
  updateDonationStatus,
} from '@/lib/demo-store';
import { toast } from 'sonner';

export default function VolunteerDashboardPage() {
  return (
    <DashboardShell
      requiredRole="volunteer"
      pageTitle="Volunteer dashboard"
      pageDescription="Your active pickups, route, and impact stats."
      pageActions={
        <Link href="/map">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Navigation className="w-4 h-4 mr-1" />
            Open route
          </Button>
        </Link>
      }
    >
      <VolunteerBody />
    </DashboardShell>
  );
}

function VolunteerBody() {
  const { user } = useCurrentUser();
  const myTasks = useDemoStore(
    () => (user ? getDonationsByVolunteer(user.id) : []),
    [],
  );
  const available = useDemoStore(() => getPendingDonations(), []);

  if (!user) return null;

  const active = myTasks.filter((d) =>
    ['assigned', 'picked-up', 'in-transit'].includes(d.status),
  );
  const todayMeals = active.reduce((acc, d) => acc + d.estimatedMeals, 0);

  const handleAdvance = (donationId: string) => {
    const donation = myTasks.find((d) => d.id === donationId);
    if (!donation) return;
    const next: Record<string, any> = {
      assigned: 'picked-up',
      'picked-up': 'in-transit',
      'in-transit': 'delivered',
    };
    const nextStatus = next[donation.status];
    if (!nextStatus) return;
    updateDonationStatus(donationId, nextStatus);
    toast.success(`Marked as ${nextStatus.replace('-', ' ')}`);
  };

  const handleClaim = (donationId: string) => {
    updateDonationStatus(donationId, 'assigned', { volunteerId: user.id });
    toast.success('Pickup claimed', {
      description: 'Tap "Start pickup" when you arrive.',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <CardContent className="pt-7 pb-7 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <Badge className="bg-white/20 hover:bg-white/20 border-white/30 text-white text-xs mb-3 capitalize">
                <Truck className="w-3 h-3 mr-1" />
                {user.vehicleType || 'Volunteer'} · {user.city}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                On duty, {user.name.split(' ')[0]}.
              </h2>
              <p className="text-cyan-50 mt-2 max-w-xl">
                You have <span className="font-bold">{active.length}</span> active
                pickup{active.length === 1 ? '' : 's'} today —{' '}
                <span className="font-bold">{todayMeals}</span> meals on the way.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/map">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl">
                  <Route className="w-4 h-4 mr-1" />
                  Open route
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active pickups"
          value={active.length}
          icon={Truck}
          tone="blue"
        />
        <StatCard
          label="Total deliveries"
          value={user.stats.totalDonations}
          icon={CheckCircle2}
          tone="emerald"
          trend={{ value: 11, positive: true }}
        />
        <StatCard
          label="Meals delivered"
          value={user.stats.mealsProvided.toLocaleString('en-IN')}
          icon={Star}
          tone="amber"
        />
        <StatCard
          label="Rating"
          value={`${user.rating} ★`}
          icon={Award}
          tone="rose"
          hint="Across 312 deliveries"
        />
      </div>

      <AiInsights role="volunteer" />

      {/* Active tasks */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's pickups</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Tap the action to advance the status
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
            {active.length} in progress
          </Badge>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No pickups assigned yet. Claim one from the available list below.
            </p>
          ) : (
            <div className="space-y-3">
              {active.map((d) => {
                const donor = getUserById(d.donorId);
                const ngo = d.ngoId ? getUserById(d.ngoId) : undefined;
                const stepLabel = {
                  assigned: 'Start pickup',
                  'picked-up': 'Mark in transit',
                  'in-transit': 'Mark delivered',
                }[d.status as 'assigned' | 'picked-up' | 'in-transit'];

                return (
                  <div
                    key={d.id}
                    className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border hover:border-blue-300 transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.imageUrl}
                      alt={d.title}
                      className="md:w-44 h-32 object-cover rounded-xl"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold">{d.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {d.description}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 capitalize">
                          {d.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {d.pickupAddress.area}
                        </span>
                        {donor && (
                          <span className="flex items-center gap-1">
                            🍴 {donor.organization || donor.name}
                          </span>
                        )}
                        {ngo && <span className="flex items-center gap-1">→ {ngo.name}</span>}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleAdvance(d.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          {stepLabel}
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/map">
                            <Navigation className="w-3 h-3 mr-1" />
                            Navigate
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/chat">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Link>
                        </Button>
                        {donor?.phone && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`tel:${donor.phone}`}>
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available pickups */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Available pickups near you</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Tap claim to add it to your route
          </p>
        </CardHeader>
        <CardContent>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              All pickups assigned. Great work team! 🙌
            </p>
          ) : (
            <div className="space-y-3">
              {available.slice(0, 4).map((d) => {
                const donor = getUserById(d.donorId);
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 p-3 rounded-xl border hover:border-blue-300 transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.imageUrl}
                      alt={d.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{d.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {d.quantityKg} kg · {d.pickupAddress.area}, {d.pickupAddress.city} ·
                        {donor ? ` ${donor.organization || donor.name}` : ''}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleClaim(d.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Claim
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
