import { NextResponse } from 'next/server';
import { users } from '@clerk/clerk-sdk-node';

export async function GET() {
  try {
    // Fetch all users (pagination can be added for large user bases)
    const allUsers = await users.getUserList({ limit: 100 }); // adjust limit as needed
    const paidUsers = allUsers.filter(
      user => user.publicMetadata?.role === 'paid'
    ).map(user => ({
      id: user.id,
      name: user.username || user.firstName || user.lastName || user.id, // Prefer username, then firstName, then lastName, then id
      role: user.publicMetadata?.role,
      tokens: user.publicMetadata?.tokens ?? 0,
    }));

    return NextResponse.json({ paidUsers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 