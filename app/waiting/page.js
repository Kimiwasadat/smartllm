'use client';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function WaitingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            if (user.publicMetadata?.isApproved) {
                router.push('/');
            }
        }
    }, [user, isLoaded, router]);

    if (!isLoaded) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            p={3}
            textAlign="center"
        >
            <Typography variant="h4" gutterBottom>
                Waiting for Approval
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Thank you for signing up! Your account is currently pending approval from an administrator.
            </Typography>
            <Typography variant="body1" color="text.secondary">
                We'll notify you once your account has been approved.
            </Typography>
            <Box mt={4}>
                <CircularProgress />
            </Box>
        </Box>
    );
} 