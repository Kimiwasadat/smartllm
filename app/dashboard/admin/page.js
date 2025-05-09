'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboardPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            const role = user.publicMetadata?.role;
            if (role !== 'admin') {
                router.push('/unauthorized');
            }
        }
    }, [isLoaded, user]);

    return (
        <main>
            <h1>Admin Dashboard</h1>
            <p>Welcome, admin user!</p>
        </main>
    );
}
