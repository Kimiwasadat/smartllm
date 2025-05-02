import { clerkClient } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, role } = req.body;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    });

    res.status(200).json({ success: true });
  } else {
    res.status(405).end();
  }
}