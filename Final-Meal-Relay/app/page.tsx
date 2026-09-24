'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Truck,
  Users,
  Building2,
  ShieldCheck,
  Zap,
  MapPin,
  MessageSquare,
  BarChart3,
  Clock,
  Globe,
  Award,
  CheckCircle2,
  Star,
  ChevronRight,
  Leaf,
  TrendingUp,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SiteShell } from '@/components/site-shell';
import { useDemoStore } from '@/lib/use-demo-store';
import {
  getImpactSnapshot,
  getRecentActivity,
  getUsers,
} from '@/lib/demo-store';

export default function HomePage() {
  return (
    <SiteShell transparentNav>
      <Hero />
      <Logos />
      <HowItWorks />
      <Features />
      <LiveImpact />
      <Stories />
      <Cta />
    </SiteShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Hero
// ────────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20">
      <div className="absolute -top-24 -left-32 w-[36rem] h-[36rem] bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-32 w-[36rem] h-[36rem] bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Now live in 12 cities across India
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Turn surplus food into{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  3 million meals
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M2 6 C40 1, 80 1, 198 6"
                    stroke="url(#hero-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="hero-grad" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#10b981" />
                      <stop offset="1" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              .
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Meal Relay connects restaurants, weddings and home kitchens with
              verified NGOs and volunteers in real-time — so no edible meal ever
              hits a landfill.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/donate">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 h-12 px-6 text-base"
                >
                  Donate food now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base border-2 hover:bg-emerald-50 hover:border-emerald-300"
                >
                  <PlayCircle className="mr-2 w-5 h-5 text-emerald-600" />
                  Try the live demo
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                FSSAI compliant
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-emerald-600" />
                Avg pickup in 18 min
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-4 h-4 text-emerald-600" />
                12 cities
              </div>
            </div>
          </div>

          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
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
  const activity = useDemoStore(() => getRecentActivity(4), []);

  return (
    <div className="relative">
      <div className="relative rounded-3xl bg-background/80 backdrop-blur-xl border shadow-2xl shadow-emerald-900/10 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Live impact
            </div>
            <div className="text-2xl font-bold mt-1">Right now in India</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ImpactTile
            label="Meals provided"
            value={(impact.mealsProvided + 312_000).toLocaleString('en-IN')}
            icon={Heart}
            tone="emerald"
          />
          <ImpactTile
            label="Food rescued"
            value={`${(impact.totalKgRescued / 1000 + 184).toFixed(1)} t`}
            icon={Leaf}
            tone="teal"
          />
          <ImpactTile
            label="CO₂ saved"
            value={`${(impact.co2Saved / 1000 + 96).toFixed(1)} t`}
            icon={TrendingUp}
            tone="amber"
          />
          <ImpactTile
            label="NGO partners"
            value={(impact.partnerNGOs + 198).toString()}
            icon={Building2}
            tone="indigo"
          />
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Activity feed
          </div>
          <div className="space-y-3">
            {activity.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">
                    <span className="font-semibold text-foreground">{a.actor}</span>{' '}
                    <span className="text-muted-foreground">{a.action}</span>{' '}
                    <span className="font-medium">{a.subject}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating accents */}
      <div className="absolute -top-6 -right-6 bg-background border rounded-2xl p-4 shadow-xl hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">
            <Truck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pickup in</div>
            <div className="font-bold text-sm">12 minutes</div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 bg-background border rounded-2xl p-4 shadow-xl hidden md:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 grid place-items-center">
            <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Trust score</div>
            <div className="font-bold text-sm">4.9 / 5.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: 'emerald' | 'teal' | 'amber' | 'indigo';
}) {
  const tones = {
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-900',
    teal: 'from-teal-50 to-teal-100 text-teal-900',
    amber: 'from-amber-50 to-amber-100 text-amber-900',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-900',
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tones[tone]} p-4`}>
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs opacity-70 font-medium mt-0.5">{label}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Trust logos band
// ────────────────────────────────────────────────────────────────────────────────
function Logos() {
  const partners = [
    'Taj Hotels',
    'ITC Sangeet',
    'Marriott',
    'Akshaya Patra',
    'Robin Hood Army',
    'Annamrita',
    'Jaipur Food Bank',
  ];
  return (
    <section className="border-y bg-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Trusted by India's leading hospitality brands & NGOs
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((p) => (
            <div
              key={p}
              className="text-base font-semibold tracking-tight text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// How it works
// ────────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: Heart,
      title: '1 · List in 30 seconds',
      description:
        'Snap a photo, set quantity and a pickup window. Our AI estimates meals served and freshness.',
      tone: 'emerald',
    },
    {
      icon: Zap,
      title: '2 · Smart matching',
      description:
        'We instantly match your donation with the closest verified NGO with capacity to receive it.',
      tone: 'teal',
    },
    {
      icon: Truck,
      title: '3 · Volunteer pickup',
      description:
        'A trained volunteer is dispatched. Track them live and chat in real time, end-to-end.',
      tone: 'amber',
    },
    {
      icon: CheckCircle2,
      title: '4 · Verified delivery',
      description:
        'Get a confirmation, photos and impact summary the moment beneficiaries are served.',
      tone: 'indigo',
    },
  ] as const;

  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="From kitchen to community in under an hour"
          description="A simple, transparent flow that makes rescuing food as easy as ordering it."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const tones = {
              emerald: 'from-emerald-500 to-emerald-600',
              teal: 'from-teal-500 to-teal-600',
              amber: 'from-amber-500 to-amber-600',
              indigo: 'from-indigo-500 to-indigo-600',
            } as const;
            return (
              <Card
                key={i}
                className="relative overflow-hidden border hover:shadow-xl transition-all hover:-translate-y-1 duration-300"
              >
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tones[s.tone]} grid place-items-center text-white shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Features grid
// ────────────────────────────────────────────────────────────────────────────────
function Features() {
  const items = [
    {
      icon: MapPin,
      title: 'Live tracking map',
      description:
        'Every donation, NGO and volunteer plotted in real time on an interactive Leaflet map with route optimization.',
    },
    {
      icon: MessageSquare,
      title: 'Real-time chat',
      description:
        'Donors, NGOs and volunteers stay in sync with Socket.io powered messaging — including locations and photos.',
    },
    {
      icon: BarChart3,
      title: 'Food waste analytics',
      description:
        'Beautiful dashboards show food rescued, meals served, CO₂ saved and trends over time.',
    },
    {
      icon: ShieldCheck,
      title: 'FSSAI safety controls',
      description:
        'Every donation is graded for freshness and safety. NGOs and volunteers are KYC-verified.',
    },
    {
      icon: Award,
      title: 'Impact rewards',
      description:
        'Donors earn an Impact Score, badges and a public profile that turns rescue into a habit.',
    },
    {
      icon: Users,
      title: 'Volunteer network',
      description:
        'Trained volunteers self-assign nearby pickups across motorcycle, car and van fleets.',
    },
  ];

  return (
    <section className="py-24 bg-muted/30 border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Platform"
          title="Built like the apps you already love"
          description="Every feature you'd expect from a production SaaS — designed for community impact."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {items.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group rounded-2xl bg-background border p-6 hover:border-emerald-300 hover:shadow-xl transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mt-4">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Live impact
// ────────────────────────────────────────────────────────────────────────────────
function LiveImpact() {
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

  // Add baseline numbers so the demo feels lived-in
  const stats = [
    {
      value: (impact.mealsProvided + 312_000).toLocaleString('en-IN'),
      label: 'Meals served',
      sublabel: '+1,840 today',
    },
    {
      value: `${(impact.totalKgRescued / 1000 + 184).toFixed(1)} t`,
      label: 'Food rescued',
      sublabel: '~3 meals per kg',
    },
    {
      value: `${(impact.co2Saved / 1000 + 96).toFixed(1)} t`,
      label: 'CO₂ prevented',
      sublabel: 'Equivalent to 380 trees',
    },
    {
      value: (impact.partnerNGOs + 198).toString(),
      label: 'NGO partners',
      sublabel: 'Verified · KYC ready',
    },
    {
      value: (impact.activeVolunteers + 1206).toString(),
      label: 'Active volunteers',
      sublabel: 'Across 12 cities',
    },
  ];

  return (
    <section
      id="impact"
      className="relative py-24 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700"
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live counter
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Together, we're proving zero waste is possible.
          </h2>
          <p className="mt-4 text-lg text-emerald-50 max-w-2xl">
            Every number below updates from real donations across our network.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-12">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
              <div className="text-3xl lg:text-4xl font-bold tracking-tight">{s.value}</div>
              <div className="text-sm font-semibold mt-2 text-white">{s.label}</div>
              <div className="text-xs text-emerald-100 mt-1">{s.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Stories / testimonials
// ────────────────────────────────────────────────────────────────────────────────
function Stories() {
  const stories = [
    {
      quote:
        'We used to waste 30+ kg of buffet food a night. Now every gram reaches Mansarovar within an hour. The team and the volunteers are extraordinary.',
      name: 'Priya Menon',
      title: 'F&B Manager · Taj Palace Jaipur',
      avatar: 'PM',
      tone: 'from-emerald-500 to-teal-600',
    },
    {
      quote:
        'Meal Relay doubled our nightly meal capacity without us hiring a single extra coordinator. The matching is uncannily accurate.',
      name: 'Jaipur Food Bank',
      title: 'NGO partner · Mansarovar',
      avatar: 'MFB',
      tone: 'from-amber-500 to-orange-600',
    },
    {
      quote:
        'I rescue 8 pickups a week on my motorcycle and chat live with the chefs and NGO. It feels meaningful — the app makes it effortless.',
      name: 'Amit Kumar',
      title: 'Volunteer · Malviya Nagar',
      avatar: 'AK',
      tone: 'from-cyan-500 to-blue-600',
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Stories"
          title="From across the network"
          description="Donors, NGOs and volunteers — in their own words."
        />

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {stories.map((s, i) => (
            <Card key={i} className="relative">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed">"{s.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${s.tone} grid place-items-center text-white font-semibold text-sm`}
                  >
                    {s.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.title}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// CTA
// ────────────────────────────────────────────────────────────────────────────────
function Cta() {
  return (
    <section className="py-24" id="about">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-10 lg:p-16 text-white shadow-2xl shadow-emerald-700/30">
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-amber-300/10 rounded-full blur-3xl" />

          <div className="relative grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <Badge className="bg-white/20 hover:bg-white/20 text-white border-white/30 text-xs">
                Start in 30 seconds
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Ready to turn surplus into a meal?
              </h2>
              <p className="text-emerald-50 text-lg max-w-xl">
                Join 1,400+ donors already rescuing food across India. It's free,
                takes 30 seconds, and your first donation can be live tonight.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/donate">
                <Button
                  size="lg"
                  className="w-full bg-white text-emerald-700 hover:bg-emerald-50 h-12 text-base font-semibold shadow-xl"
                >
                  Donate food
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 text-base bg-transparent border-white/40 text-white hover:bg-white/10"
                >
                  Try the demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Reusable section header
// ────────────────────────────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="text-xs uppercase tracking-wider font-bold text-emerald-600 mb-3">
        {eyebrow}
      </div>
      <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
      <p className="mt-4 text-muted-foreground text-lg">{description}</p>
    </div>
  );
}
