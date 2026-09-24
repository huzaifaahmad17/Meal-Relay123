'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { DonationsList } from '@/components/dashboard/donations-list';
import { useCurrentUser, useDemoStore } from '@/lib/use-demo-store';
import {
  getDonationsByVolunteer,
  getPendingDonations,
} from '@/lib/demo-store';

export default function VolunteerTasksPage() {
  return (
    <DashboardShell
      requiredRole="volunteer"
      pageTitle="Pickup tasks"
      pageDescription="Active pickups + open requests you can claim."
    >
      <Body />
    </DashboardShell>
  );
}

function Body() {
  const { user } = useCurrentUser();
  const myTasks = useDemoStore(
    () => (user ? getDonationsByVolunteer(user.id) : []),
    [],
  );
  const open = useDemoStore(() => getPendingDonations(), []);
  const combined = [...myTasks, ...open];
  if (!user) return null;
  return <DonationsList donations={combined} />;
}
