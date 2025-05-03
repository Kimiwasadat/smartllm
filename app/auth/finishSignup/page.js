'use client'
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import  { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function FinishSignup() {
    const SearchParams = useSearchParams();
    const {user, isLoaded} = useUser();
    const router = useRouter();
    useEffect(() => {
        if (isLoaded && user) {
            const role = SearchParams.get('role') || 'free';
            fetch('/api/set-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id,  role }),
            });
        }
    }, [user, isLoaded]);
    return(
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <h1>Thank you for signing up! Signing you in to your role, please wait...</h1>
        </div>
    )
}