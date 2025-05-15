import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function GET(req, { params }) {
    const { userId } = await getAuth(req);

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify if the requesting user is an admin
    const adminUser = await clerkClient.users.getUser(userId);
    if (adminUser.publicMetadata?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Get the target user's data
        const targetUserId = params.userId;
        const user = await clerkClient.users.getUser(targetUserId);
        
        return NextResponse.json({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.publicMetadata?.role || 'free',
            tokens: user.publicMetadata?.tokens || 0,
            canAccess: user.publicMetadata?.canAccess,
            rejections: user.publicMetadata?.rejections || []
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
} 