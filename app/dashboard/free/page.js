'use client';
import { Box, Typography, Button, Paper, Container, Alert } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TokenPackages from '@/components/TokenPackages';

export default function FreeDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

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

      <Paper elevation={3} sx={{ p: 4, mb: 4, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h4" gutterBottom>
          Free Plan Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          You're currently on the free plan with limited access. Upgrade to unlock more features!
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/auth/signUp?plan=paid')}
          >
            Upgrade to Paid Plan
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Purchase Additional Tokens
      </Typography>
      <Typography variant="body1" paragraph>
        Need more tokens? Choose from our token packages below:
      </Typography>
      
      <TokenPackages />
    </Container>
  );
}
