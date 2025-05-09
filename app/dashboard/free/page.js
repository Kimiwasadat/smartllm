import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { fetchUserRole } from '@/app/utils/auth';

export default async function FreeDashboardPage() {
  try {
    const { userId } = auth();
    if (!userId) return redirect('/auth/signIn');

    const role = await fetchUserRole();
    if (role !== 'free') return redirect('/unauthorized');

    return (
      <main>
        <h1>Free Dashboard</h1>
        <p>Welcome, free user!</p>
      </main>
    );
  } catch (error) {
    return redirect('/unauthorized');
  }
}
