'use client';
import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function TestCooldown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/check-free');
      const data = await response.json();
      setStatus(data);
      setError(null);

      // If user is in cooldown, force sign out
      if (data.inCooldown) {
        await signOut();
        router.push('/auth/signIn');
      }
    } catch (err) {
      setError('Failed to check status');
      console.error(err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user]);

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Cooldown Test Page
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Current User:</Typography>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">API Response:</Typography>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {status?.inCooldown && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {status.error}
          </Alert>
        )}

        <Button 
          variant="contained" 
          onClick={checkStatus}
          sx={{ mt: 2 }}
        >
          Refresh Status
        </Button>
      </Paper>
    </Box>
  );
} 