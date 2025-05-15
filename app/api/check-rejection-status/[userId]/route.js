import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/clerk-sdk-node';

export async function GET(req, { params }) {
    const userId = params.userId;

    try {
        const user = await clerkClient.users.getUser(userId);
        const rejections = user.publicMetadata?.rejections || [];
        
        return NextResponse.json({ rejections });
    } catch (error) {
        console.error('Error checking rejection status:', error);
        return NextResponse.json({ error: 'Failed to check rejection status' }, { status: 500 });
    }
} 