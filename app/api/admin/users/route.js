import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { userId } = getAuth(req);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get the current user to check admin status
        const currentUser = await clerkClient.users.getUser(userId);
        
        // Check if user is admin
        if (currentUser.publicMetadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get all users
        const allUsers = await clerkClient.users.getUserList();
        
        // Map all users with their token information
        const users = allUsers.map(user => ({
            id: user.id,
            email: user.emailAddresses?.[0]?.emailAddress || '',
            username: user.username || user.firstName || user.lastName || user.id,
            role: user.publicMetadata?.role || 'free',
            availableTokens: user.publicMetadata?.tokens || 0,
            usedTokens: user.publicMetadata?.usedTokens || 0,
            correctionsMade: user.publicMetadata?.correctionsMade || 0,
            status: user.publicMetadata?.status || 'active'
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 