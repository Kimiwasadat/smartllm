'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard/paid';

  useEffect(() => {
    const doRefresh = async () => {
      if (isLoaded && user) {
        // Reload the user to get the latest metadata from Clerk
        await user.reload();
        router.replace(redirectUrl);
      }
    };
    doRefresh();
  }, [user, isLoaded, router, redirectUrl]);

  return <div>Refreshing your account...</div>;
} 