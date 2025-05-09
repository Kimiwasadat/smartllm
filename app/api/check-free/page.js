import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { session } = auth();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const role = session.publicMetadata?.role;

  if (role !== 'free') {
    return NextResponse.json({ error: 'Only free users allowed' }, { status: 405 });
  }

  return NextResponse.json({ message: 'Welcome, free user!' }, { status: 200 });
}
