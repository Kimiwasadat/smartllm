'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';

export default function SuspendedPage() {
    const router = useRouter();

    useEffect(() => {
        // Automatically sign out the user
        window.location.href = '/sign-out';
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
                Account Suspended
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Your account has been suspended. Please contact the administrator for more information.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push('/')}>Go to Home</Button>
        </Box>
    );
} 