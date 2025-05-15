'use client';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const handleRedirect = () => {
    if (!isLoaded || !user) {
      router.push('/auth/signIn');
      return;
    }

    const role = user.publicMetadata?.role;
    if (role === 'paid') {
      router.push('/dashboard/paid');
    } else if (role === 'free') {
      router.push('/dashboard/free');
    } else if (role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="error">
          🚫 Unauthorized Access
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          You do not have permission to access this page. Please return to your dashboard or contact support if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRedirect}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
