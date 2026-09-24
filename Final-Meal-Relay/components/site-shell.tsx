'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Menu,
  X,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { BrandMark } from './brand-mark';
import { useCurrentUser } from '@/lib/use-demo-store';
import { cn } from '@/lib/utils';

interface SiteShellProps {
  children: ReactNode;
  transparentNav?: boolean;
}

const navLinks = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Live map', href: '/map' },
  { label: 'Impact', href: '/#impact' },
  { label: 'About', href: '/#about' },
];

export function SiteShell({ children, transparentNav = false }: SiteShellProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useCurrentUser();

  const dashboardLink =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'ngo'
      ? '/ngo/dashboard'
      : user?.role === 'volunteer'
      ? '/volunteer/dashboard'
      : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        className={cn(
          'sticky top-0 z-50 transition-all',
          transparentNav
            ? 'bg-background/40 backdrop-blur-xl border-b border-white/10'
            : 'bg-background/80 backdrop-blur-md border-b',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <BrandMark size="md" />

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/donate">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                >
                  Donate food
                </Button>
              </Link>
              {user ? (
                <Link href={dashboardLink}>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                  >
                    Open dashboard
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                    >
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {open && (
            <div className="lg:hidden border-t py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-1 text-sm font-medium text-foreground/70"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/donate" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Donate food
                  </Button>
                </Link>
                {user ? (
                  <Link href={dashboardLink} onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Open dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <BrandMark size="md" />
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Connecting India's restaurants and homes with NGOs and volunteers
                to rescue surplus food and feed those who need it most.
              </p>
              <div className="flex gap-2">
                <Link href="#" className="w-9 h-9 rounded-full bg-background border grid place-items-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-9 h-9 rounded-full bg-background border grid place-items-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-9 h-9 rounded-full bg-background border grid place-items-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Get started</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/donate" className="hover:text-foreground">Donate food</Link></li>
                <li><Link href="/auth/register?role=ngo" className="hover:text-foreground">Register your NGO</Link></li>
                <li><Link href="/auth/register?role=volunteer" className="hover:text-foreground">Become a volunteer</Link></li>
                <li><Link href="/map" className="hover:text-foreground">Live impact map</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Food safety guidelines</Link></li>
                <li><Link href="#" className="hover:text-foreground">Impact reports</Link></li>
                <li><Link href="#" className="hover:text-foreground">Community stories</Link></li>
                <li><Link href="/analytics" className="hover:text-foreground">Public dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>hello@mealrelay.org</span></li>
                <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>1800-FOOD-HELP</span></li>
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>MI Road, Jaipur 302001</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p>© 2026 Meal Relay. Built for a hunger-free Jaipur.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground">Privacy</Link>
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
