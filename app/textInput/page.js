'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TextInput from '../../components/textInput';

export default function TextInputPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      // Only redirect if user is not logged in
      router.replace('/auth/signIn');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <div>
      <h1>Submit Your Text</h1>
      <TextInput />
    </div>
  );
}