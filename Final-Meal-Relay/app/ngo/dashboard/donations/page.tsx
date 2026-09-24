'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { DonationsList } from '@/components/dashboard/donations-list';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import { getDonations, getDonationsByNGO } from '@/lib/demo-store';

export default function NgoDonationsPage() {
  return (
    <DashboardShell
      requiredRole="ngo"
      pageTitle="Donation pipeline"
      pageDescription="All donations matched, accepted, or in transit for your NGO."
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const { user } = useCurrentUser();
  const myDonations = useDemoStore(
    () => (user ? getDonationsByNGO(user.id) : []),
    [],
  );
  // Also include unassigned (pending) donations so NGO sees what's available
  const pending = useDemoStore(
    () => getDonations().filter((d) => d.status === 'pending'),
    [],
  );
  const combined = [...pending, ...myDonations];
  if (!user) return null;
  return <DonationsList donations={combined} />;
}
