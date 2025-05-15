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

        const { userId: targetUserId, amount, reason } = await req.json();

        // Get the user to deduct tokens from
        const targetUser = await clerkClient.users.getUser(targetUserId);
        
        const currentTokens = targetUser.publicMetadata?.tokens || 0;
        const newTokens = Math.max(0, currentTokens - amount); // Ensure tokens don't go below 0

        // Update user metadata with new token count
        await clerkClient.users.updateUser(targetUserId, {
            publicMetadata: {
                ...targetUser.publicMetadata,
                tokens: newTokens,
                tokenTransactions: [
                    ...(targetUser.publicMetadata?.tokenTransactions || []),
                    {
                        type: 'deduction',
                        amount,
                        reason,
                        timestamp: new Date().toISOString()
                    }
                ]
            }
        });

        return NextResponse.json({ success: true, newTokenCount: newTokens });
    } catch (error) {
        console.error('Error deducting tokens:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 