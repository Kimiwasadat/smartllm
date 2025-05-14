'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TextInput from '../../components/textInput';

export default function TextInputPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (user?.publicMetadata?.role !== 'paid') {
        router.replace('/dashboard/free');
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || user?.publicMetadata?.role !== 'paid') {
    return null; // or a loading spinner
  }

  return (
    <div>
      <h1>Submit Your Text</h1>
      <TextInput />
    </div>
  );
}