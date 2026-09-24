'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  MapPin,
  BarChart3,
  Bell,
  LogOut,
  Settings,
  Users,
  Truck,
  Building2,
  Heart,
  Menu,
  X,
  Search,
  Plus,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import {
  getNotificationsForUser,
  getRoomsForUser,
  logout as storeLogout,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/demo-store';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  roles?: UserRole[];
}

const navByRole: Record<UserRole, NavItem[]> = {
  donor: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Donations', href: '/dashboard/donations', icon: Package },
    { label: 'Live Map', href: '/map', icon: MapPin },
    { label: 'Messages', href: '/chat', icon: MessageSquare },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ],
  ngo: [
    { label: 'Overview', href: '/ngo/dashboard', icon: LayoutDashboard },
    { label: 'Donations', href: '/ngo/dashboard/donations', icon: Package },
    { label: 'Volunteers', href: '/ngo/dashboard/volunteers', icon: Users },
    { label: 'Live Map', href: '/map', icon: MapPin },
    { label: 'Messages', href: '/chat', icon: MessageSquare },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ],
  volunteer: [
    { label: 'Overview', href: '/volunteer/dashboard', icon: LayoutDashboard },
    { label: 'Pickups', href: '/volunteer/dashboard/tasks', icon: Truck },
    { label: 'Live Map', href: '/map', icon: MapPin },
    { label: 'Messages', href: '/chat', icon: MessageSquare },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ],
  admin: [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/dashboard/users', icon: Users },
    { label: 'Donations', href: '/admin/dashboard/donations', icon: Package },
    { label: 'NGOs', href: '/admin/dashboard/ngos', icon: Building2 },
    { label: 'Live Map', href: '/map', icon: MapPin },
    { label: 'Messages', href: '/chat', icon: MessageSquare },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ],
};

interface DashboardShellProps {
  children: ReactNode;
  requiredRole?: UserRole;
  pageTitle?: string;
  pageDescription?: string;
  pageActions?: ReactNode;
}

export function DashboardShell({
  children,
  requiredRole,
  pageTitle,
  pageDescription,
  pageActions,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect if no auth
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      // route to that role's correct dashboard
      const roleHome: Record<UserRole, string> = {
        donor: '/dashboard',
        ngo: '/ngo/dashboard',
        volunteer: '/volunteer/dashboard',
        admin: '/admin/dashboard',
      };
      router.replace(roleHome[user.role]);
    }
  }, [ready, user, requiredRole, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  const navItems = navByRole[user.role];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background sticky top-0 h-screen">
        <SidebarBody navItems={navItems} pathname={pathname} role={user.role} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarBody
            navItems={navItems}
            pathname={pathname}
            role={user.role}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        {(pageTitle || pageActions) && (
          <header className="border-b bg-background/60 backdrop-blur px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                {pageTitle && (
                  <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                )}
                {pageDescription && (
                  <p className="text-sm text-muted-foreground mt-1">{pageDescription}</p>
                )}
              </div>
              {pageActions && <div className="flex items-center gap-2">{pageActions}</div>}
            </div>
          </header>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Sidebar
// ────────────────────────────────────────────────────────────────────────────────
function SidebarBody({
  navItems,
  pathname,
  role,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  role: UserRole;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const handleLogout = () => {
    storeLogout();
    router.replace('/auth/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b">
        <BrandMark size="md" href="/" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {role === 'admin' ? 'Administration' : 'Workspace'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5 px-1.5 text-[10px]',
                    isActive && 'bg-white/20 text-white border-white/20',
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="px-3 py-2 mt-6 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Personal
        </div>
        <Link
          href="/donate"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
        >
          <Heart className="w-4 h-4" />
          Donate Food
        </Link>
        <button
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </nav>

      <div className="p-3 border-t">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
          <div className="text-xs font-medium opacity-90">Impact today</div>
          <div className="text-2xl font-bold mt-1">3,420 meals</div>
          <div className="text-[11px] opacity-90 mt-1">across 42 active deliveries</div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Topbar
// ────────────────────────────────────────────────────────────────────────────────
function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const notifications = useDemoStore(
    () => (user ? getNotificationsForUser(user.id) : []),
    [],
  );
  const rooms = useDemoStore(() => (user ? getRoomsForUser(user.id) : []), []);

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const unreadMessages = rooms.reduce((acc, r) => acc + r.unreadCount, 0);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between gap-3 px-4 lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden md:flex relative w-64 lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search donations, NGOs, volunteers…"
            className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-input"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/donate')}
          className="hidden sm:flex"
        >
          <Plus className="w-4 h-4 mr-1" />
          New donation
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* Messages */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push('/chat')}
        >
          <MessageSquare className="w-4 h-4" />
          {unreadMessages > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] grid place-items-center font-semibold">
              {unreadMessages}
            </span>
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] grid place-items-center font-semibold">
                  {unreadNotifs}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
              <button
                onClick={() => markAllNotificationsRead(user.id)}
                className="text-xs text-emerald-600 hover:underline"
              >
                Mark all read
              </button>
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.link) router.push(n.link);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-3 hover:bg-muted/60 border-b last:border-b-0 flex gap-3',
                      !n.read && 'bg-emerald-50/40 dark:bg-emerald-950/10',
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        n.read ? 'bg-muted-foreground/30' : 'bg-emerald-600',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {n.description}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-1 hover:bg-muted/50 rounded-full pl-1 pr-2 py-1 transition-colors">
              <div
                className={cn(
                  'w-8 h-8 rounded-full bg-gradient-to-br grid place-items-center text-white text-xs font-semibold',
                  user.avatarColor,
                )}
              >
                {user.initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold">{user.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {user.role}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>{user.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/chat')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                storeLogout();
                router.replace('/auth/login');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// helper
// ────────────────────────────────────────────────────────────────────────────────
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
