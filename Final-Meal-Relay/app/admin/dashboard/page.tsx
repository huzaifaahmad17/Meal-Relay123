'use client';

import {
  Users,
  Building2,
  Truck,
  Package,
  TrendingUp,
  Activity,
  Globe,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { useDemoStore } from '@/lib/use-demo-store';
import {
  getCityBreakdown,
  getDonationStatusBreakdown,
  getDonations,
  getDonationsByCategory,
  getDonationsByDay,
  getImpactSnapshot,
  getRecentActivity,
  getUsers,
  getUsersByRole,
} from '@/lib/demo-store';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1', '#ec4899'];

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      requiredRole="admin"
      pageTitle="System control"
      pageDescription="Real-time platform health and operations across India."
    >
      <AdminBody />
    </DashboardShell>
  );
}

function AdminBody() {
  const impact = useDemoStore(() => getImpactSnapshot(), {
    totalDonations: 0,
    totalKgRescued: 0,
    mealsProvided: 0,
    co2Saved: 0,
    activeUsers: 0,
    partnerNGOs: 0,
    activeVolunteers: 0,
    citiesCovered: 0,
  });
  const donations = useDemoStore(() => getDonations(), []);
  const trend = useDemoStore(() => getDonationsByDay(14), []);
  const byCategory = useDemoStore(() => getDonationsByCategory(), []);
  const byCity = useDemoStore(() => getCityBreakdown(), []);
  const byStatus = useDemoStore(() => getDonationStatusBreakdown(), []);
  const activity = useDemoStore(() => getRecentActivity(10), []);
  const users = useDemoStore(() => getUsers(), []);
  const ngos = useDemoStore(() => getUsersByRole('ngo'), []);
  const volunteers = useDemoStore(() => getUsersByRole('volunteer'), []);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl" />
        <CardContent className="pt-7 pb-7 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <Badge className="bg-white/20 hover:bg-white/20 border-white/30 text-white text-xs mb-3">
                <Activity className="w-3 h-3 mr-1" />
                System healthy · All services operational
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Platform overview</h2>
              <p className="text-slate-200 mt-2 max-w-xl">
                Live metrics across donors, NGOs and volunteers in {impact.citiesCovered} cities.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Tile label="Uptime" value="99.98%" />
              <Tile label="API p95" value="184ms" />
              <Tile label="Errors" value="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={users.length} icon={Users} tone="indigo" />
        <StatCard label="NGO partners" value={ngos.length} icon={Building2} tone="amber" />
        <StatCard label="Volunteers" value={volunteers.length} icon={Truck} tone="blue" />
        <StatCard label="Donations" value={donations.length} icon={Package} tone="emerald" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Food rescued"
          value={`${impact.totalKgRescued} kg`}
          icon={TrendingUp}
          tone="emerald"
          trend={{ value: 18, positive: true }}
        />
        <StatCard
          label="Meals served"
          value={impact.mealsProvided.toLocaleString('en-IN')}
          icon={Heart}
          tone="rose"
        />
        <StatCard
          label="CO₂ saved"
          value={`${impact.co2Saved} kg`}
          icon={Activity}
          tone="teal"
        />
        <StatCard
          label="Cities"
          value={impact.citiesCovered}
          icon={Globe}
          tone="indigo"
        />
      </div>

      <AiInsights role="admin" />

      {/* Trend chart */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Donations & meals · last 14 days</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Stacked daily volume</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="adminGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
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
                <Legend />
                <Area
                  type="monotone"
                  dataKey="donations"
                  name="Donations"
                  stroke="#10b981"
                  fill="url(#adminGrad1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="meals"
                  name="Meals"
                  stroke="#0ea5e9"
                  fill="url(#adminGrad2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>By food category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2 text-xs">
              {byCategory.slice(0, 5).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {c.name}
                  </div>
                  <span className="font-semibold">{c.value} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Donations by city</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCity} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byStatus.map((s) => (
              <div key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">
                    {s.status.replace('-', ' ')}
                  </span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      statusColor(s.status),
                    )}
                    style={{
                      width: `${(s.count / donations.length) * 100 || 4}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent users + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {users.slice(0, 8).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full bg-gradient-to-br grid place-items-center text-white text-xs font-semibold',
                      u.avatarColor,
                    )}
                  >
                    {u.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{u.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {u.email} · {u.city}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize text-[10px]',
                    u.role === 'admin' && 'border-slate-700 bg-slate-50',
                    u.role === 'donor' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                    u.role === 'ngo' && 'border-amber-200 bg-amber-50 text-amber-800',
                    u.role === 'volunteer' && 'border-blue-200 bg-blue-50 text-blue-800',
                  )}
                >
                  {u.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Live activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                <div>
                  <div>
                    <span className="font-semibold">{a.actor}</span>{' '}
                    <span className="text-muted-foreground">{a.action}</span>{' '}
                    <span className="font-medium">{a.subject}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 px-4 py-3">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-300">{label}</div>
    </div>
  );
}

function statusColor(s: string) {
  switch (s) {
    case 'pending': return 'bg-amber-500';
    case 'accepted': return 'bg-blue-500';
    case 'assigned': return 'bg-violet-500';
    case 'picked-up': return 'bg-cyan-500';
    case 'in-transit': return 'bg-indigo-500';
    case 'delivered': return 'bg-emerald-500';
    default: return 'bg-rose-500';
  }
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
