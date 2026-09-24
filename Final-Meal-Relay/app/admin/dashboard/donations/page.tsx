'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { DonationsList } from '@/components/dashboard/donations-list';
import { useDemoStore } from '@/lib/use-demo-store';
import { getDonations } from '@/lib/demo-store';

export default function AdminDonationsPage() {
  return (
    <DashboardShell
      requiredRole="admin"
      pageTitle="All donations"
      pageDescription="Every donation in the system. Filter, search and audit."
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const donations = useDemoStore(() => getDonations(), []);
  return <DonationsList donations={donations} />;
}
