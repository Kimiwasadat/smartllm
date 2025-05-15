import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { userId } = getAuth(req);

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Get the current user to check admin status
        const currentUser = await clerkClient.users.getUser(userId);
        
        // Check if user is admin
        if (currentUser.publicMetadata?.role !== 'admin') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Get all users
        const allUsers = await clerkClient.users.getUserList();
        
        // Filter and map paid users with their token information
        const paidUsers = allUsers
            .filter(user => user.publicMetadata?.role === 'paid')
            .map(user => ({
                id: user.id,
                username: user.username || user.firstName || user.lastName || user.id,
                role: user.publicMetadata?.role || 'free',
                availableTokens: user.publicMetadata?.tokens || 0,
                status: user.publicMetadata?.status || 'active'
            }));

        return NextResponse.json(paidUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 