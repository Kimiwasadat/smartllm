'use client';
import { useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard/paid';

  useEffect(() => {
    const refresh = async () => {
      await signOut();
      router.push('/auth/signIn?redirect=' + redirectUrl);
    };
    refresh();
  }, [signOut, router, redirectUrl]);

  return <div>Refreshing your session...</div>;
} 