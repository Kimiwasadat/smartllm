'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FreeDashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            const role = user.publicMetadata?.role;
            if (role !== 'free') {
                router.push('/unauthorized');
            }
        }
    }, [isLoaded, user]);

    return (
        <main>
            <h1>Free Dashboard</h1>
            <p>Welcome, free user!</p>
        </main>
    );
}
