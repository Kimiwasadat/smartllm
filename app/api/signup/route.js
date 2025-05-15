import { users } from '@clerk/clerk-sdk-node';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { userId } = await req.json();

        // Set user as unapproved by default
        await users.updateUser(userId, {
            publicMetadata: {
                isApproved: false,
                role: 'free',
                canAccess: false
            }
        });

        // Return success with redirect URL
        return NextResponse.json({ 
            success: true,
            redirectUrl: '/waiting'
        });
    } catch (error) {
        console.error('Error in signup:', error);
        return NextResponse.json(
            { error: 'Failed to process signup' },
            { status: 500 }
        );
    }
} 