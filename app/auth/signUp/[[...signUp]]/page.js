'use client';
import { AppBar, Container, Toolbar, Typography, Button, Box, Paper, Tabs, Tab } from '@mui/material';
import { SignUp, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import "@fontsource/inter";

export default function SignUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free');
    const { user, isLoaded } = useUser();
    const [suspended, setSuspended] = useState(false);

    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.role === 'suspended') {
            setSuspended(true);
            window.location.href = '/sign-out';
        }
    }, [isLoaded, user]);

    const handlePlanChange = (event, newValue) => {
        setSelectedPlan(newValue);
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
                    <Button onClick={() => router.push('/auth/signIn')} variant="contained">Sign In</Button>
                </Toolbar>
            </AppBar>

            <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
                <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Create Your Account
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Tabs 
                            value={selectedPlan} 
                            onChange={handlePlanChange}
                            sx={{ mb: 3 }}
                        >
                            <Tab 
                                label="Free Plan" 
                                value="free"
                                sx={{ 
                                    color: selectedPlan === 'free' ? '#4F46E5' : 'inherit',
                                    '&.Mui-selected': { color: '#4F46E5' }
                                }}
                            />
                            <Tab 
                                label="Paid Plan" 
                                value="paid"
                                sx={{ 
                                    color: selectedPlan === 'paid' ? '#4F46E5' : 'inherit',
                                    '&.Mui-selected': { color: '#4F46E5' }
                                }}
                            />
                        </Tabs>
                    </Box>

                    <Typography variant="body1" align="center" color="textSecondary" paragraph>
                        {selectedPlan === 'paid' 
                            ? 'Get unlimited access to our AI text editor with premium features'
                            : 'Start with our free plan and upgrade anytime'}
                    </Typography>

                    <Box display="flex" justifyContent="center" mt={3}>
                        <SignUp 
                            afterSignUpUrl={`/auth/finishSignup?role=${selectedPlan}`}
                            appearance={{
                                elements: {
                                    formButtonPrimary: {
                                        backgroundColor: '#4F46E5',
                                        '&:hover': {
                                            backgroundColor: '#4338CA',
                                        },
                                    },
                                    card: {
                                        boxShadow: 'none',
                                    },
                                },
                            }}
                        />
                    </Box>

                    <Box display="flex" justifyContent="center" mt={3}>
                        <Typography variant="body2" color="textSecondary">
                            Already have an account?{' '}
                            <Button 
                                color="primary" 
                                onClick={() => router.push(`/auth/signIn?plan=${selectedPlan}`)}
                                sx={{ textTransform: 'none' }}
                            >
                                Sign in
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
