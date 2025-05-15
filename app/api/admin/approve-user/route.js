import { currentUser } from '@clerk/nextjs';
import { users } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const user = await currentUser();

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { userId: targetUserId } = await req.json();

        // Get the user to approve
        const targetUser = await users.getUser(targetUserId);
        
        // Update user metadata
        await users.updateUser(targetUserId, {
            publicMetadata: {
                ...targetUser.publicMetadata,
                isApproved: true,
                canAccess: true,
                status: 'approved',
                approvedAt: new Date().toISOString()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error approving user:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 