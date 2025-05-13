import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    const user = userId ? await currentUser() : null;

    // If no user is found, return success (they can try to sign in)
    if (!user) {
      return NextResponse.json({ 
        canAccess: true,
        role: 'free'
      });
    }

    // Check if user is in cooldown period
    const lastExceedTime = user.publicMetadata?.lastExceedTime;
    if (lastExceedTime) {
      const timeSinceExceed = Date.now() - Number(lastExceedTime);
      const threeMinutesInMs = 180000; // 3 minutes in milliseconds
      
      console.log('Debug - Time check:', {
        lastExceedTime,
        currentTime: Date.now(),
        timeSinceExceed,
        threeMinutesInMs
      });
      
      if (timeSinceExceed < threeMinutesInMs) {
        const minutesRemaining = Math.ceil((threeMinutesInMs - timeSinceExceed) / 60000);
        // Force sign out if in cooldown
        try {
          await clerkClient.sessions.revokeSession(userId);
        } catch (error) {
          console.error('Failed to revoke session:', error);
        }
        
        return NextResponse.json({ 
          error: `You must wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before logging in again`,
          inCooldown: true,
          minutesRemaining,
          canAccess: false
        }, { status: 403 });
      }
    }

    return NextResponse.json({ 
      canAccess: true,
      role: user.publicMetadata?.role || 'free'
    });

  } catch (error) {
    console.error('Error checking free access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [email]
    });

    if (users.length === 0) {
      // New user, allow sign in
      return NextResponse.json({ canAccess: true });
    }

    const user = users[0];
    
    // Check if user is in timeout period
    const lastExceedTime = user.publicMetadata?.lastExceedTime;
    if (user.publicMetadata?.canAccess === false && lastExceedTime) {
      const timeSinceExceed = Date.now() - Number(lastExceedTime);
      const threeMinutesInMs = 180000;

      if (timeSinceExceed < threeMinutesInMs) {
        const minutesRemaining = Math.ceil((threeMinutesInMs - timeSinceExceed) / 60000);
        // Block sign-in
        return NextResponse.json({ 
          error: `You must wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before logging in again`,
          inCooldown: true,
          minutesRemaining,
          canAccess: false
        }, { status: 403 });
      } else {
        // Timeout expired, restore access
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            canAccess: true
            // Optionally: lastExceedTime: undefined
          }
        });
        // Allow sign-in
        return NextResponse.json({ canAccess: true });
      }
    }

    return NextResponse.json({ canAccess: true });

  } catch (error) {
    console.error('Error checking free access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 