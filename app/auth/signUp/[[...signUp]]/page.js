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
                    <Button onClick={() => router.push('/auth/signUp?plan=free')} variant="contained">Sign Up Free</Button>
                    <Button onClick={() => router.push('/auth/signUp?plan=paid')} variant="outlined">Sign Up Paid</Button>
                </Toolbar>
            </AppBar>

            <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
                <Typography variant="h4" sx={{ fontStyle: 'italic', color: '#3c3c3c' }}>Sign Up</Typography>
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
                <SignUp afterSignUpUrl={`/auth/finishSignup?role=${plan}`} />
            </Box>
        </Container>
    );
}
