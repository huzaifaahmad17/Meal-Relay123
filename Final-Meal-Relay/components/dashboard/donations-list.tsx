'use client';

import { useState, useMemo } from 'react';
import { Donation, DonationStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DonationCard } from './donation-card';
import { Search, SlidersHorizontal, Inbox } from 'lucide-react';

interface DonationsListProps {
  donations: Donation[];
  emptyMessage?: string;
}

const STATUS_OPTIONS: { value: DonationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked-up', label: 'Picked up' },
  { value: 'in-transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function DonationsList({ donations, emptyMessage }: DonationsListProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DonationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'quantity' | 'priority'>('recent');

  const filtered = useMemo(() => {
    let result = donations;
    if (status !== 'all') result = result.filter((d) => d.status === status);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.pickupAddress.area.toLowerCase().includes(q) ||
          d.pickupAddress.city.toLowerCase().includes(q),
      );
    }
    if (sortBy === 'recent') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === 'quantity') {
      result = [...result].sort((a, b) => b.quantityKg - a.quantityKg);
    } else if (sortBy === 'priority') {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      result = [...result].sort((a, b) => order[a.priority] - order[b.priority]);
    }
    return result;
  }, [donations, search, status, sortBy]);

  return (
    <div className="space-y-4">
      <Card className="border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, area, city…"
                className="pl-9 h-10"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as DonationStatus | 'all')}>
              <SelectTrigger className="w-full md:w-48 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full md:w-48 h-10">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="quantity">Largest first</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
          {donations.length} donations
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-muted grid place-items-center mx-auto">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {emptyMessage || 'No donations match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DonationCard key={d.id} donation={d} />
          ))}
        </div>
      )}
    </div>
  );
}
