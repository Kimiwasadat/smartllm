import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';


export async function POST(req) {
    const body = await req.json();
    const { userId, role } = body;
  
        if (!userId || !role) {
            return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
        }
        const allowedRoles = ['free', 'paid'];
        if (!allowedRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        try
        {
            await clerkClient.users.updateUser(userId, {
                publicMetadata: { role },
            });

            return NextResponse.json({ success: true })
            
        }catch (error) {
            console.error('Error updating role:', error);
            return  NextResponse.json({ error: 'Role not set, error' }, {status: 500 });
        }

    }
