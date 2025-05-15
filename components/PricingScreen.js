'use client';
import { Box, Paper, Button, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';

export default function PricingScreen() {
    const router = useRouter();

    return (
        <>
            <h1 style={{ alignItems: 'left' }}>Pricing</h1>
            <Stack direction='row' spacing={2}>
                <Box sx={{ display: "flex", gap: 3, justifyContent: 'center' }}>
                    {/* Free Plan */}
                    <Paper sx={{ p: 3, width: 350 }}>
                        <Typography variant="h5">Free Plan</Typography>
                        <Typography variant="h4" fontWeight="bold">$0 / month</Typography>
                        <Typography>Explore SmartLLM risk-free</Typography>
                        <Button onClick={() => router.push('/auth/signUp?plan=free')}>Start Free</Button>
                    </Paper>

                    {/* Paid Plan */}
                    <Paper sx={{ p: 3, width: 350 }}>
                        <Typography variant="h5">Paid Plan</Typography>
                        <Typography variant="h4" fontWeight="bold">$20 / month</Typography>
                        <Typography>Unlock premium features</Typography>
                        <Button onClick={() => router.push('/auth/signUp?plan=paid')}>Go Paid</Button>
                    </Paper>

                    {/* Admin Plan */}
                    <Paper sx={{ p: 3, width: 350 }}>
                        <Typography variant="h5">Admin Plan</Typography>
                        <Typography variant="h4" fontWeight="bold">$100+ / month</Typography>
                        <Typography>Full admin control</Typography>
                        <Button onClick={() => router.push('/auth/signUp?plan=admin')}>Become Admin</Button>
                    </Paper>
                </Box>
            </Stack>
        </>
    );
}
