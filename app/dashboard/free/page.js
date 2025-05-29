import { Suspense } from 'react';
import FreeDashboardClient from './FreeDashboardClient';

export default function FreeDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FreeDashboardClient />
    </Suspense>
  );
}
