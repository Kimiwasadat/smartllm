import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function POST(req) {
    try {
        const { userId, text, correction, reason } = await req.json();

        // Store the rejection in the user's metadata
        const user = await clerkClient.users.getUser(userId);
        const rejections = user.publicMetadata?.rejections || [];

        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                rejections: [
                    ...rejections,
                    {
                        id: Date.now().toString(),
                        text,
                        correction,
                        reason,
                        status: 'pending',
                        timestamp: new Date().toISOString()
                    }
                ]
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting rejection:', error);
        return NextResponse.json({ error: 'Failed to submit rejection' }, { status: 500 });
    }
} 