'use client';

import { Donation } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  Package,
  MessageSquare,
  Truck,
  ChevronRight,
  Leaf,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getUserById } from '@/lib/demo-store';

interface DonationCardProps {
  donation: Donation;
  href?: string;
  compact?: boolean;
  showAssigned?: boolean;
}

const statusConfig: Record<
  Donation['status'],
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending match',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  assigned: {
    label: 'Volunteer assigned',
    className: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  'picked-up': {
    label: 'Picked up',
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  'in-transit': {
    label: 'In transit',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export function DonationCard({
  donation,
  href = '/chat',
  compact,
  showAssigned = true,
}: DonationCardProps) {
  const status = statusConfig[donation.status];
  const ngo = donation.ngoId ? getUserById(donation.ngoId) : undefined;
  const volunteer = donation.volunteerId ? getUserById(donation.volunteerId) : undefined;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={donation.imageUrl}
          alt={donation.title}
          className={cn(
            'object-cover',
            compact ? 'sm:w-32 h-24 sm:h-auto' : 'sm:w-44 h-32 sm:h-auto',
          )}
        />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold truncate">{donation.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {donation.description}
              </p>
            </div>
            <Badge className={cn('flex-shrink-0', status.className)}>
              {status.label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {donation.quantityKg} kg
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {donation.estimatedMeals} meals
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {donation.pickupAddress.area}, {donation.pickupAddress.city}
            </span>
            <span className="flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-600" />
              {donation.co2SavedKg} kg CO₂
            </span>
          </div>

          {showAssigned && (ngo || volunteer) && (
            <div className="flex items-center gap-3 text-xs">
              {ngo && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-gradient-to-br grid place-items-center text-white text-[9px] font-bold',
                      ngo.avatarColor,
                    )}
                  >
                    {ngo.initials}
                  </div>
                  <span className="text-muted-foreground">{ngo.name}</span>
                </div>
              )}
              {volunteer && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-gradient-to-br grid place-items-center text-white text-[9px] font-bold',
                      volunteer.avatarColor,
                    )}
                  >
                    {volunteer.initials}
                  </div>
                  <span className="text-muted-foreground">{volunteer.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link href="/map">
                <MapPin className="w-3 h-3 mr-1" />
                Track
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link href={href}>
                <MessageSquare className="w-3 h-3 mr-1" />
                Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
