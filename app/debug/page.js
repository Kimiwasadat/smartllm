import { auth, clerkClient } from '@clerk/nextjs/server';

export default async function DebugPage() {
  const { userId, sessionId } = auth();

  let user = null;
  if (userId) {
    user = await clerkClient.users.getUser(userId);
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🛠 Debug Page</h1>
      <p><strong>userId:</strong> {userId || 'none'}</p>
      <p><strong>sessionId:</strong> {sessionId || 'none'}</p>
      <pre style={{ background: '#f0f0f0', padding: '1rem' }}>
        {user ? JSON.stringify(user, null, 2) : 'No user loaded'}
      </pre>
    </main>
  );
}
