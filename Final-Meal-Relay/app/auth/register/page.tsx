'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  User,
  Phone,
  Lock,
  AlertCircle,
  ArrowRight,
  Heart,
  Building2,
  Truck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { UserRole } from '@/lib/types';
import { setCurrentUser } from '@/lib/demo-store';
import { toast } from 'sonner';

const roles: {
  id: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  tone: string;
}[] = [
  {
    id: 'donor',
    label: 'I want to donate food',
    description: 'Restaurant, hotel, event organizer or individual',
    icon: Heart,
    tone: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'ngo',
    label: 'I run an NGO',
    description: 'Receive surplus food and distribute it to communities',
    icon: Building2,
    tone: 'from-amber-500 to-orange-600',
  },
  {
    id: 'volunteer',
    label: 'I want to volunteer',
    description: 'Pick up donations and deliver them to NGOs',
    icon: Truck,
    tone: 'from-cyan-500 to-blue-600',
  },
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'donor';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));

    // Demo: log in as a matching seeded user instead of writing a new one
    const fallbackByRole: Record<UserRole, string> = {
      donor: 'user_donor_4',
      ngo: 'user_ngo_2',
      volunteer: 'user_vol_2',
      admin: 'user_admin_1',
    };

    setCurrentUser(fallbackByRole[selectedRole]);
    toast.success(`Welcome to Meal Relay, ${name.split(' ')[0] || 'friend'}!`, {
      description: 'Your demo workspace is ready.',
    });

    const target =
      selectedRole === 'admin'
        ? '/admin/dashboard'
        : selectedRole === 'ngo'
        ? '/ngo/dashboard'
        : selectedRole === 'volunteer'
        ? '/volunteer/dashboard'
        : '/dashboard';

    router.push(target);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[3fr_2fr] bg-background">
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-10 max-h-screen overflow-y-auto">
        <BrandMark size="md" />
        <div className="flex-1 max-w-2xl w-full mx-auto py-10">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">Pick how you'd like to contribute.</p>
          </div>

          <div className="grid gap-3 mb-8">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`group relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-600/10'
                      : 'border-muted hover:border-emerald-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.tone} grid place-items-center text-white shadow-lg flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 grid place-items-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Card className="border-2">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priya Menon"
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98XXX XXXXX"
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org">
                      {selectedRole === 'ngo'
                        ? 'NGO name'
                        : selectedRole === 'donor'
                        ? 'Restaurant / org (optional)'
                        : 'Affiliation (optional)'}
                    </Label>
                    <Input
                      id="org"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder={selectedRole === 'ngo' ? 'Jaipur Food Bank' : 'Taj Palace Jaipur'}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up you agree to our Terms and Privacy Policy.
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-12 text-white items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-md space-y-6">
          <Badge className="bg-white/20 hover:bg-white/20 border-white/30 text-white">
            Free forever · No credit card
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Join 1,400+ donors and NGOs already rescuing food.
          </h2>
          <ul className="space-y-3 pt-4">
            {[
              'Real-time pickup tracking',
              'Smart NGO matching',
              'Built-in chat with volunteers',
              'Beautiful impact dashboards',
              'FSSAI safety controls',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-emerald-50">
                <div className="w-5 h-5 rounded-full bg-white/20 grid place-items-center">
                  <Sparkles className="w-3 h-3" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
