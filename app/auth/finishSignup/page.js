'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function FinishSignup() {
  const { user, isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const assignRole = async () => {
      if (isLoaded && user && isSignedIn) {
        const role = searchParams.get('role') || 'free';
        console.log('🎯 Setting role:', role, 'for user:', user.id);

        try {
          const res = await fetch('/api/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, role }),
          });

          if (!res.ok) throw new Error('Failed to set role');
          
          console.log('✅ Role set successfully, redirecting to dashboard');
          // Add a small delay to ensure the role is set
          setTimeout(() => {
            router.push(`/dashboard/${role}`);
          }, 1000);
        } catch (err) {
          console.error('❌ Error setting role:', err);
          router.push('/unauthorized');
        }
      } else if (isLoaded && !isSignedIn) {
        console.log('❌ User not signed in, redirecting to sign in');
        router.push('/auth/signIn');
      }
    };

    assignRole();
  }, [isLoaded, user, isSignedIn, router, searchParams]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Setting up your account...</h1>
      <p>Please wait while we configure your access.</p>
    </div>
  );
}
