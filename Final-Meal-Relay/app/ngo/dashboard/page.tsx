'use client';

import {
  Building2,
  Inbox,
  Truck,
  Heart,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Leaf,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { DonationCard } from '@/components/dashboard/donation-card';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import {
  getDonationsByDay,
  getDonationsByNGO,
  getPendingDonations,
  getUserById,
  getUsersByRole,
  updateDonationStatus,
} from '@/lib/demo-store';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NgoDashboardPage() {
  return (
    <DashboardShell
      requiredRole="ngo"
      pageTitle="NGO control center"
      pageDescription="Incoming donations, volunteer assignments, and live distribution metrics."
      pageActions={
        <Link href="/map">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            View live map
          </Button>
        </Link>
      }
    >
      <NgoDashboardBody />
    </DashboardShell>
  );
}

function NgoDashboardBody() {
  const { user } = useCurrentUser();
  const myDonations = useDemoStore(
    () => (user ? getDonationsByNGO(user.id) : []),
    [],
  );
  const pending = useDemoStore(() => getPendingDonations(), []);
  const trend = useDemoStore(() => getDonationsByDay(14), []);
  const volunteers = useDemoStore(() => getUsersByRole('volunteer'), []);

  if (!user) return null;

  const accepted = myDonations.filter((d) =>
    ['accepted', 'assigned', 'picked-up', 'in-transit'].includes(d.status),
  );
  const totalMeals = myDonations.reduce((acc, d) => acc + d.estimatedMeals, 0);
  const todayCapacityUsed = Math.min(60, accepted.length * 10 + 30);

  const handleAccept = (donationId: string) => {
    updateDonationStatus(donationId, 'accepted', { ngoId: user.id });
    toast.success('Donation accepted', {
      description: 'A volunteer will be auto-assigned shortly.',
    });
  };

  const handleAssign = (donationId: string, volunteerId: string) => {
    updateDonationStatus(donationId, 'assigned', { volunteerId, ngoId: user.id });
    toast.success('Volunteer assigned');
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <CardContent className="pt-7 pb-7 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <Badge className="bg-white/20 hover:bg-white/20 border-white/30 text-white text-xs mb-3">
                <Building2 className="w-3 h-3 mr-1" />
                Verified NGO · {user.city}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-amber-50 mt-2 max-w-xl">
                You have <span className="font-bold">{pending.length}</span> donations
                waiting for review and{' '}
                <span className="font-bold">{accepted.length}</span> active deliveries.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <CapacityTile label="Capacity used" value={`${todayCapacityUsed}%`} />
              <CapacityTile label="Volunteers" value={volunteers.length.toString()} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending requests"
          value={pending.length}
          icon={Inbox}
          tone="amber"
          hint="Awaiting your review"
        />
        <StatCard
          label="Active deliveries"
          value={accepted.length}
          icon={Truck}
          tone="indigo"
          trend={{ value: 14, positive: true }}
        />
        <StatCard
          label="Meals distributed"
          value={totalMeals.toLocaleString('en-IN')}
          icon={Heart}
          tone="rose"
          trend={{ value: 22, positive: true }}
        />
        <StatCard
          label="Daily capacity"
          value={`${user.capacity || 1200}`}
          icon={Users}
          tone="emerald"
          hint="Meals/day"
        />
      </div>

      <AiInsights role="ngo" />

      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Smart-matched donations</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Donations near you that match your capacity & preferences
            </p>
          </div>
          <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
            {pending.length} pending
          </Badge>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No pending donations right now. Check back soon.
            </p>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 4).map((d) => {
                const donor = getUserById(d.donorId);
                return (
                  <div
                    key={d.id}
                    className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border hover:border-emerald-300 transition-all"
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
                        <Badge
                          className={cn(
                            'capitalize',
                            d.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : d.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-muted text-foreground/70',
                          )}
                        >
                          {d.priority}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" /> {d.quantityKg} kg
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {d.estimatedMeals} meals
                        </span>
                        <span className="flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-emerald-600" /> {d.co2SavedKg} kg CO₂
                        </span>
                        {donor && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {donor.organization || donor.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(d.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleAssign(d.id, volunteers[0]?.id || 'user_vol_1')
                          }
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Auto-assign volunteer
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border">
          <CardHeader>
            <CardTitle>Donations received · last 14 days</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Volume trend across all incoming donations
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="donations" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Available volunteers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {volunteers.slice(0, 5).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full bg-gradient-to-br grid place-items-center text-white text-xs font-semibold',
                      v.avatarColor,
                    )}
                  >
                    {v.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{v.name}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">
                      {v.vehicleType} · {v.city}
                    </div>
                  </div>
                </div>
                {v.online ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Offline</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Active deliveries assigned to you</h3>
        </div>
        {accepted.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-10 pb-10 text-center text-sm text-muted-foreground">
              No active deliveries. Accept a donation above to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {accepted.slice(0, 5).map((d) => (
              <DonationCard key={d.id} donation={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CapacityTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 px-4 py-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-amber-50">{label}</div>
    </div>
  );
}
