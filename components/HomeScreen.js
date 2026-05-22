'use client'
import React, {useEffect, useRef} from 'react';
import { Typed } from 'react-typed';
import {Button, Paper, Box, Stack, Typography, Container} from '@mui/material'
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const TypedComponent = () =>{
    const elRef = useRef(null);
    const typedInstance = useRef(null);
  
    useEffect(() => {
      typedInstance.current = new Typed(elRef.current, {
        strings: [
          'Your text editing and collaboration needs solved.',
          'Create and edit your text with absolute ease.',
          'Grammar checked, polished, and ready to impress.',
        ],
        typeSpeed: 40,
        backSpeed: 20,
        loop: true,
        showCursor: true,
        cursorChar: '|',
      });
  
      return () => {
        typedInstance.current.destroy();
      };
    }, []);
  
    return <span ref={elRef} className="text-accent font-medium" />;
};

export default function HomeScreen(){
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const handleGetStarted = () => {
        if (!isLoaded) return;

        if (!user) {
            router.push('/auth/signUp');
            return;
        }

        const role = user.publicMetadata?.role;
        if (role === 'admin') {
            router.push('/dashboard/admin');
        } else if (role === 'paid') {
            router.push('/textInput');
        } else {
            router.push('/dashboard/free');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box className="glass-panel animate-fade-in" sx={{ p: 8, textAlign: 'center', maxWidth: '800px', width: '100%', mt: 10, mb: 10 }}>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome to SmartLLM
                </Typography>
                
                <Typography variant="h5" sx={{ mb: 6, color: 'var(--color-muted)', minHeight: '60px', lineHeight: 1.6 }}>
                    <TypedComponent />
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        onClick={handleGetStarted}
                        sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
                    >
                        Get Started Free
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        size="large"
                        sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
                    >
                        Learn More
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
}