'use client';
import { Box, Typography, Button, Paper, Container, Alert, Grid } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TokenPackages from '@/components/TokenPackages';
import { useUser } from '@clerk/nextjs';

export default function FreeDashboardClient() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const role = user?.publicMetadata?.role;
      if (role !== 'free') {
        if (role === 'paid') {
          router.replace('/unauthorized');
        } else if (role === 'admin') {
          router.replace('/unauthorized');
        } else {
          router.replace('/');
        }
      }
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    // Check for success or error messages in URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (canceled) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }, [searchParams]);

  if (!isLoaded || user?.publicMetadata?.role !== 'free') {
    return null; // or a loading spinner
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Payment successful! Your tokens have been added to your account.
        </Alert>
      )}
      
      {showError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Payment was canceled. Please try again if you wish to purchase tokens.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h4" gutterBottom>
              Free Plan Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              You're currently on the free plan with limited access. Upgrade to unlock more features!
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => router.push('/auth/signUp?plan=paid')}
              >
                Upgrade to Paid Plan
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push('/textInput')}
              >
                Start Editing Text
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Purchase Additional Tokens
          </Typography>
          <Typography variant="body1" paragraph>
            Need more tokens? Choose from our token packages below:
          </Typography>
          <TokenPackages />
        </Grid>
      </Grid>
    </Container>
  );
} 