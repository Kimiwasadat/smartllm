'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function FinishSignupClient() {
  const { user, isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const assignRole = async () => {
      if (isLoaded && user && isSignedIn) {
        const role = searchParams.get('role') || 'free';
        try {
          const res = await fetch('/api/set-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, role }),
          });
          if (!res.ok) throw new Error('Failed to set role');
          setTimeout(() => {
            router.push(`/dashboard/${role}`);
          }, 2000);
        } catch (err) {
          router.push('/unauthorized');
        }
      } else if (isLoaded && !isSignedIn) {
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