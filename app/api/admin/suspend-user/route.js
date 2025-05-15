import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function POST(req) {
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

        const { userId: targetUserId } = await req.json();

        // Get the user to suspend
        const targetUser = await clerkClient.users.getUser(targetUserId);
        
        // Update user metadata to suspend them
        await clerkClient.users.updateUser(targetUserId, {
            publicMetadata: {
                ...targetUser.publicMetadata,
                status: 'suspended',
                role: 'suspended',
                suspendedAt: new Date().toISOString()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error suspending user:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 