'use client';

import Link from 'next/link';
import {
  Heart,
  Package,
  Leaf,
  Users,
  Award,
  Plus,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Trophy,
  CalendarCheck,
  Truck,
} from 'lucide-react';
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
  getDonationsByDonor,
  getRecentActivity,
} from '@/lib/demo-store';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DonorDashboardPage() {
  return (
    <DashboardShell
      requiredRole="donor"
      pageTitle="Donor dashboard"
      pageDescription="Track your donations, see your live impact, and chat with NGOs."
      pageActions={
        <Link href="/donate">
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="w-4 h-4 mr-1" />
            New donation
          </Button>
        </Link>
      }
    >
      <DonorDashboardBody />
    </DashboardShell>
  );
}

function DonorDashboardBody() {
  const { user } = useCurrentUser();
  const donations = useDemoStore(
    () => (user ? getDonationsByDonor(user.id) : []),
    [],
  );
  const trend = useDemoStore(() => getDonationsByDay(14), []);
  const activity = useDemoStore(() => getRecentActivity(8), []);

  if (!user) return null;
  const stats = user.stats;
  const active = donations.filter((d) =>
    ['pending', 'accepted', 'assigned', 'picked-up', 'in-transit'].includes(d.status),
  );
  const delivered = donations.filter((d) => d.status === 'delivered');

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="border-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-amber-300/10 rounded-full blur-3xl" />
        <CardContent className="pt-7 pb-7 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <Badge className="bg-white/20 hover:bg-white/20 border-white/30 text-white text-xs mb-3">
                <Sparkles className="w-3 h-3 mr-1" />
                {user.organization || 'Donor'}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.name.split(' ')[0]}.
              </h2>
              <p className="text-emerald-50 mt-2 max-w-xl">
                You've rescued {stats.totalKgRescued} kg of food and provided {stats.mealsProvided.toLocaleString('en-IN')} meals so far. Let's keep the momentum going.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/donate">
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl">
                  <Plus className="w-4 h-4 mr-1" />
                  New donation
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10">
                  Live map
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total donations"
          value={stats.totalDonations}
          icon={Package}
          tone="emerald"
          trend={{ value: 12, positive: true }}
          hint="Lifetime"
        />
        <StatCard
          label="Food rescued"
          value={`${stats.totalKgRescued} kg`}
          icon={Leaf}
          tone="teal"
          trend={{ value: 18, positive: true }}
          hint="Across all categories"
        />
        <StatCard
          label="Meals provided"
          value={stats.mealsProvided.toLocaleString('en-IN')}
          icon={Users}
          tone="amber"
          trend={{ value: 22, positive: true }}
          hint="≈ 3 meals per kg"
        />
        <StatCard
          label="CO₂ saved"
          value={`${stats.co2Saved} kg`}
          icon={TrendingUp}
          tone="indigo"
          trend={{ value: 9, positive: true }}
          hint="Greenhouse impact"
        />
      </div>

      {/* Trend chart + impact card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Food waste rescued · last 14 days</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Daily kg of food rescued through your donations
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              kg / day
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="rescueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="kg"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#rescueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Impact score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-4xl font-bold tracking-tight">
                {stats.impactScore.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-muted-foreground">
                Top 5% of donors in {user.city}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Monthly goal · 25 donations</span>
                <span className="font-semibold">{Math.min(stats.totalDonations, 25)} / 25</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.totalDonations / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-4 space-y-2 border-t">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <div className="text-sm font-semibold">Community Hero</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Unlocked at 100 donations · Permanent badge
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AiInsights role="donor" />

      {/* Active deliveries + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Active deliveries</h3>
            <Link href="/dashboard/donations" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {active.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {active.slice(0, 4).map((d) => (
                <DonationCard key={d.id} donation={d} />
              ))}
            </div>
          )}
        </div>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground">
                      <span className="font-semibold">{a.actor}</span>{' '}
                      <span className="text-muted-foreground">{a.action}</span>{' '}
                      <span className="font-medium">{a.subject}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {timeAgo(a.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivered history */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent deliveries</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Donations that reached the community</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
            {delivered.length} delivered
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {delivered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Your delivered donations will show up here.
            </p>
          ) : (
            delivered.slice(0, 3).map((d) => <DonationCard key={d.id} donation={d} compact />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-10 pb-10 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 grid place-items-center mx-auto">
          <Truck className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="font-bold">No active deliveries</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When you create a donation, you'll see live status here as NGOs accept and volunteers pick it up.
        </p>
        <Link href="/donate">
          <Button className="bg-emerald-600 hover:bg-emerald-700 mt-2">
            <Plus className="w-4 h-4 mr-1" />
            Donate food
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
