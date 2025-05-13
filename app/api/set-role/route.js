import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId, ...metadata } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        public_metadata: metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Clerk API error:', errorData);
      return NextResponse.json({ error: 'Failed to update user metadata' }, { status: 500 });
    }

    console.log(`✅ Successfully updated public metadata for user ${userId}`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Failed to call Clerk API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
