'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { DonationsList } from '@/components/dashboard/donations-list';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import { getDonationsByDonor } from '@/lib/demo-store';

export default function DonorDonationsPage() {
  return (
    <DashboardShell
      requiredRole="donor"
      pageTitle="My donations"
      pageDescription="Every donation you've ever listed, with status & filters."
      pageActions={
        <Link href="/donate">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-1" />
            New donation
          </Button>
        </Link>
      }
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const { user } = useCurrentUser();
  const donations = useDemoStore(
    () => (user ? getDonationsByDonor(user.id) : []),
    [],
  );
  if (!user) return null;
  return (
    <DonationsList
      donations={donations}
      emptyMessage="You haven't created any donations yet. Tap 'New donation' to start."
    />
  );
}
