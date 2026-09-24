'use client';

import { useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, MapPin, Star } from 'lucide-react';
import { useDemoStore } from '@/lib/use-demo-store';
import { getUsers } from '@/lib/demo-store';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';

export default function AdminUsersPage() {
  return (
    <DashboardShell
      requiredRole="admin"
      pageTitle="Users"
      pageDescription="Manage donors, NGOs, volunteers and admins across the network."
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const users = useDemoStore(() => getUsers(), []);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (
        search &&
        !`${u.name} ${u.email} ${u.city} ${u.organization || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['donor', 'ngo', 'volunteer', 'admin'] as const).map((r) => (
          <Card key={r} className="border">
            <CardContent className="pt-5 pb-5">
              <div className="text-2xl font-bold">
                {users.filter((u) => u.role === r).length}
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-1 capitalize">
                {r}s
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, city, organization…"
                className="pl-9 h-10"
              />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(['all', 'donor', 'ngo', 'volunteer', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all',
                    roleFilter === r
                      ? 'bg-background shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-4 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Role</th>
                  <th className="text-left px-4 py-3 font-semibold">Location</th>
                  <th className="text-left px-4 py-3 font-semibold">Stats</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
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
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[10px]',
                          u.role === 'admin' && 'border-slate-700 bg-slate-50',
                          u.role === 'donor' &&
                            'border-emerald-200 bg-emerald-50 text-emerald-800',
                          u.role === 'ngo' && 'border-amber-200 bg-amber-50 text-amber-800',
                          u.role === 'volunteer' && 'border-blue-200 bg-blue-50 text-blue-800',
                        )}
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {u.address.area}, {u.city}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <span className="font-semibold">{u.stats.totalDonations}</span> donations ·{' '}
                        <span className="font-semibold">
                          {u.stats.mealsProvided.toLocaleString('en-IN')}
                        </span>{' '}
                        meals
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {u.rating} rating
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5',
                          u.online
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            u.online ? 'bg-emerald-500' : 'bg-muted-foreground',
                          )}
                        />
                        {u.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
