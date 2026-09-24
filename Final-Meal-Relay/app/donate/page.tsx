'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  Leaf,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DonationForm } from '@/components/donation-form';
import { SiteShell } from '@/components/site-shell';

export default function DonatePage() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <DonationForm onBack={() => setShowForm(false)} />;
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20">
        <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 px-3 py-1 text-xs font-semibold">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Free · Tax deductible · 30 seconds
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Donate food. <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Create a meal in 60 minutes.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Whether it's a 5 kg leftover from dinner or 200 plates from a wedding —
                we'll connect you with a verified NGO and dispatch a volunteer within minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 h-12 px-6 text-base"
                >
                  Start donation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base border-2"
                  asChild
                >
                  <a href="tel:1800-FOOD-HELP">
                    <Phone className="mr-2 w-4 h-4 text-emerald-600" />
                    Call for pickup
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <Stat label="Avg pickup" value="18 min" />
                <Stat label="NGO partners" value="200+" />
                <Stat label="Cities" value="12" />
              </div>
            </div>

            <Card className="border-2 shadow-2xl shadow-emerald-900/10 overflow-hidden">
              <CardContent className="p-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1000"
                  alt="Volunteers distributing food"
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 grid place-items-center">
                      <Heart className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-bold">Today's most-needed</div>
                      <div className="text-xs text-muted-foreground">
                        4,200 meals across 8 NGOs
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Jaipur Food Bank', meals: 1200, area: 'Mansarovar' },
                      { name: 'Robin Hood Army', meals: 1800, area: 'Connaught Place' },
                      { name: 'Akshaya Patra', meals: 1200, area: 'Koramangala' },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <div className="text-sm font-semibold">{row.name}</div>
                          <div className="text-xs text-muted-foreground">{row.area}</div>
                        </div>
                        <Badge className="bg-emerald-600 text-white">
                          {row.meals.toLocaleString('en-IN')} needed
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What we accept */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-wider font-bold text-emerald-600 mb-3">
              Accepted donations
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              All edible, safe-to-eat food is welcome
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Cooked meals, fresh produce, packaged goods, baked items — if you'd eat it
              within 24 hours, it can save someone's day.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {[
              { emoji: '🍛', name: 'Cooked meals' },
              { emoji: '🥬', name: 'Fresh produce' },
              { emoji: '🥖', name: 'Baked goods' },
              { emoji: '🥛', name: 'Dairy products' },
              { emoji: '📦', name: 'Packaged' },
              { emoji: '🍰', name: 'Desserts' },
              { emoji: '🌾', name: 'Grains & cereals' },
              { emoji: '🥤', name: 'Beverages' },
            ].map((c) => (
              <Card key={c.name} className="border hover:border-emerald-300 transition-all hover:-translate-y-0.5">
                <CardContent className="pt-5 pb-5 text-center space-y-2">
                  <div className="text-4xl">{c.emoji}</div>
                  <div className="font-semibold text-sm">{c.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: 'FSSAI safe',
                description: 'All donations are graded for freshness & safety before pickup.',
              },
              {
                icon: Clock,
                title: 'Time-sensitive',
                description: 'Cooked food should be available within 4 hours of preparation.',
              },
              {
                icon: Leaf,
                title: 'No commitment',
                description: 'Donate once or set up recurring pickups — we adapt to you.',
              },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <Card key={row.title} className="border">
                  <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-bold">{row.title}</div>
                    <div className="text-sm text-muted-foreground">{row.description}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Ready to make your first rescue?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Setup takes 30 seconds. Your first NGO match in under 90 seconds.
          </p>
          <Button
            size="lg"
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 h-12 px-8 text-base"
          >
            Donate now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
