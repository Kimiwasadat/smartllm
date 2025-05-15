'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box, Paper, Alert } from '@mui/material';
import { SignIn, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import "@fontsource/inter";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
  const [cooldownError, setCooldownError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { user, isLoaded } = useUser();
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'cooldown') {
      setCooldownError('You are currently in a cooldown period. Please wait before trying again.');
    } else if (error === 'access_denied') {
      setCooldownError('Your access has been revoked. Please contact support if you believe this is an error.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role === 'suspended') {
      setSuspended(true);
      window.location.href = '/sign-out';
    }
  }, [isLoaded, user]);

  const handleBeforeSignIn = async (e) => {
    if (isChecking) return false;
    setIsChecking(true);

    try {
      const email = e.emailAddress;
      const response = await fetch('/api/check-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok || data.canAccess === false || data.inCooldown) {
        setCooldownError(data.error || 'You are currently in a timeout period. Please wait before trying again.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking cooldown:', error);
      setCooldownError('An error occurred while checking your status. Please try again.');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  if (suspended) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
        Your account has been suspended. Please contact the administrator.
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 10 }}>
      <AppBar position="static" sx={{ backgroundColor: '#1A1E2E', padding: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>SmartLLM</Typography>
          <Button onClick={() => router.push('/auth/signUp')} variant="contained">Sign Up</Button>
        </Toolbar>
      </AppBar>

      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" paragraph>
            {plan === 'paid' 
              ? 'Sign in to access premium features and unlimited text editing'
              : 'Sign in to start editing your text with our AI'}
          </Typography>
          
          {cooldownError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cooldownError}
            </Alert>
          )}
          
          <Box display="flex" justifyContent="center" mt={3}>
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: {
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  },
                },
              }}
              beforeSignIn={handleBeforeSignIn}
              routing="path"
              path="/auth/signIn"
              signUpUrl="/auth/signUp"
              redirectUrl="/"
            />
          </Box>

          <Box display="flex" justifyContent="center" mt={3}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Button 
                color="primary" 
                onClick={() => router.push(`/auth/signUp?plan=${plan}`)}
                sx={{ textTransform: 'none' }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
