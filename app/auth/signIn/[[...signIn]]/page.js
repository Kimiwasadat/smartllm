'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box } from '@mui/material';
import { SignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'free';

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 10 }}>
      <AppBar position="static" sx={{ backgroundColor: '#1A1E2E', padding: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>SmartLLM</Typography>
          <Button onClick={() => router.push('/auth/signIn')}>Sign In</Button>
        </Toolbar>
      </AppBar>

      <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
        <Typography variant="h4">Sign Up</Typography>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
        <SignUp afterSignUpUrl={`/auth/finishSignup?role=${plan}`} />
      </Box>
    </Container>
  );
}
