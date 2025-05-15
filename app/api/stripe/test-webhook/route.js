import { NextResponse } from 'next/server';
import { users } from '@clerk/clerk-sdk-node';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user metadata
    const user = await users.getUser(userId);
    const currentMetadata = user.publicMetadata || {};
    
    // Simulate adding tokens
    const tokensToAdd = 100;
    const currentTokens = Number(currentMetadata.tokens) || 0;
    const newTokenTotal = currentTokens + tokensToAdd;

    // Update metadata
    const newMetadata = {
      ...currentMetadata,
      role: 'paid',
      tokens: newTokenTotal
    };

    await users.updateUser(userId, {
      publicMetadata: newMetadata
    });

    // Verify update
    const updatedUser = await users.getUser(userId);

    return NextResponse.json({
      success: true,
      before: {
        tokens: currentTokens,
        metadata: currentMetadata
      },
      after: {
        tokens: newTokenTotal,
        metadata: updatedUser.publicMetadata
      }
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 