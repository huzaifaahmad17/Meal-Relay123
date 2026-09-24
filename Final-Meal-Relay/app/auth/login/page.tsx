'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { DEMO_CREDENTIALS, login } from '@/lib/demo-store';
import { BrandMark } from '@/components/brand-mark';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate latency
    await new Promise((r) => setTimeout(r, 400));

    const user = login(email, password);
    if (!user) {
      setError('Invalid email or password. Try one of the demo accounts below.');
      setIsLoading(false);
      return;
    }

    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    const target =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'ngo'
        ? '/ngo/dashboard'
        : user.role === 'volunteer'
        ? '/volunteer/dashboard'
        : '/dashboard';
    router.push(target);
  };

  const fillDemo = (cred: typeof DEMO_CREDENTIALS[number]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left — form */}
      <div className="flex flex-col px-6 sm:px-12 lg:px-20 py-10">
        <BrandMark size="md" />

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-12">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to continue rescuing food and creating impact.
            </p>
          </div>

          <Card className="border-2 shadow-xl shadow-emerald-900/5">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs text-emerald-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or try a demo account
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => fillDemo(cred)}
                    className="w-full text-left border rounded-lg px-3 py-2.5 hover:bg-muted/60 hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize px-1.5 py-0"
                          >
                            {cred.role}
                          </Badge>
                          {cred.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {cred.email}
                        </div>
                      </div>
                      <Sparkles className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Meal Relay?{' '}
            <Link href="/auth/register" className="text-emerald-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-12 text-white items-center justify-center overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />

        <div className="relative max-w-md space-y-8">
          <Badge className="bg-white/20 hover:bg-white/20 border-white/30 text-white">
            <ShieldCheck className="w-3 h-3 mr-1.5" />
            Secure · End-to-end encrypted
          </Badge>

          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Every meal you save is a victory against hunger.
          </h2>

          <p className="text-emerald-50 text-lg leading-relaxed">
            Meal Relay connects donors with NGOs and volunteers across Jaipur in
            real time. Your dashboard is waiting.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <Stat label="Meals saved" value="312K+" />
            <Stat label="NGO partners" value="200+" />
            <Stat label="Cities" value="12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-emerald-100 mt-1">{label}</div>
    </div>
  );
}
