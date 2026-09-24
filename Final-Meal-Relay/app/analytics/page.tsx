'use client';

import {
  TrendingUp,
  Leaf,
  Heart,
  Users,
  Globe,
  Building2,
  Truck,
  Package,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardShell } from '@/components/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { useDemoStore } from '@/lib/use-demo-store';
import {
  getCityBreakdown,
  getDonationStatusBreakdown,
  getDonationsByCategory,
  getDonationsByDay,
  getImpactSnapshot,
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
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PIE_COLORS = [
  '#10b981',
  '#0ea5e9',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#6366f1',
  '#ec4899',
];

export default function AnalyticsPage() {
  return (
    <DashboardShell
      pageTitle="Analytics"
      pageDescription="Deep dives into food waste, impact and operations across the network."
    >
      <AnalyticsBody />
    </DashboardShell>
  );
}

function AnalyticsBody() {
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
  const trend30 = useDemoStore(() => getDonationsByDay(30), []);
  const byCategory = useDemoStore(() => getDonationsByCategory(), []);
  const byCity = useDemoStore(() => getCityBreakdown(), []);
  const byStatus = useDemoStore(() => getDonationStatusBreakdown(), []);
  const ngos = useDemoStore(() => getUsersByRole('ngo'), []);

  // Top NGO leaderboard data
  const ngoLeaderboard = ngos
    .slice()
    .sort((a, b) => b.stats.mealsProvided - a.stats.mealsProvided)
    .slice(0, 6)
    .map((n) => ({
      name: n.name.replace(/Foundation| Bengaluru| Delhi/, ''),
      meals: n.stats.mealsProvided,
      donations: n.stats.totalDonations,
    }));

  // Radar — operational health
  const opsHealth = [
    { metric: 'Pickup speed', value: 92 },
    { metric: 'Match accuracy', value: 96 },
    { metric: 'Volunteer activity', value: 88 },
    { metric: 'NGO uptake', value: 94 },
    { metric: 'Donor retention', value: 90 },
    { metric: 'Safety score', value: 98 },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Food rescued"
          value={`${impact.totalKgRescued} kg`}
          icon={Leaf}
          tone="emerald"
          trend={{ value: 18, positive: true }}
        />
        <StatCard
          label="Meals served"
          value={impact.mealsProvided.toLocaleString('en-IN')}
          icon={Heart}
          tone="rose"
          trend={{ value: 22, positive: true }}
        />
        <StatCard
          label="CO₂ avoided"
          value={`${impact.co2Saved} kg`}
          icon={TrendingUp}
          tone="teal"
          trend={{ value: 9, positive: true }}
        />
        <StatCard
          label="Cities covered"
          value={impact.citiesCovered}
          icon={Globe}
          tone="indigo"
        />
      </div>

      {/* Trend chart */}
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Food rescued · 30-day trend</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Daily kg of food and meals served — dual axis
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Last 30 days
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend30}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
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
                <Legend />
                <Area
                  type="monotone"
                  dataKey="kg"
                  name="Food rescued (kg)"
                  stroke="#10b981"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Food category mix</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Where the rescued food comes from
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
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
            <div className="grid grid-cols-2 gap-2 text-xs">
              {byCategory.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between gap-2 p-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="font-semibold flex-shrink-0">{c.value} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* City heat */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Donations by city</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Active donor + NGO presence per city
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCity} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
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
                  <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NGO leaderboard + ops health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              NGO leaderboard
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">By meals served — all time</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ngoLeaderboard} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="meals" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Operational health</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live KPIs across the rescue network
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={opsHealth}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Health"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status table */}
      <Card className="border">
        <CardHeader>
          <CardTitle>Donation status pipeline</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Live counts across the lifecycle
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {byStatus.map((s) => (
              <div key={s.status} className="rounded-2xl border p-4 bg-muted/30">
                <div className="text-xs text-muted-foreground capitalize">
                  {s.status.replace('-', ' ')}
                </div>
                <div className="text-2xl font-bold mt-1">{s.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
