import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { checkPaidAccess } from '@/app/utils/auth';

export default async function PaidDashboardPage() {
  try {
    // First check authentication
    const { userId } = auth();
    if (!userId) {
      console.log('❌ No userId found, redirecting to sign in');
      return redirect('/auth/signIn');
    }
    console.log('🔑 User is authenticated:', userId);

    // Then check for paid access
    const hasPaidAccess = await checkPaidAccess();
    console.log('🔒 Paid access check result:', hasPaidAccess);

    if (!hasPaidAccess) {
      console.log('❌ No paid access, redirecting to unauthorized');
      return redirect('/unauthorized');
    }

    return (
      <main style={{ padding: '2rem' }}>
        <h1>🚀 Paid User Dashboard</h1>
        <p>Welcome to your exclusive paid dashboard!</p>
        <div style={{ marginTop: '2rem' }}>
          <h2>Your Premium Features</h2>
          <ul>
            <li>Advanced AI capabilities</li>
            <li>Priority support</li>
            <li>Unlimited usage</li>
          </ul>
        </div>
      </main>
    );
  } catch (error) {
    console.error('❌ Error in paid dashboard:', error);
    return redirect('/unauthorized');
  }
}
