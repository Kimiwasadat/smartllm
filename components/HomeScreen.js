'use client'
import React, {useEffect, useRef} from 'react';
import { Typed } from 'react-typed';
import {Button, Paper, Box, Stack} from '@mui/material'
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const TypedComponent = () =>{
    const elRef = useRef(null);
    const typedInstance = useRef(null);
  
    useEffect(() => {
      typedInstance.current = new Typed(elRef.current, {
        strings: [
          'Your text editing and collaboration needs solved',
          'Create and edit your text with ease',
          'Check your grammar and make sure your writing is tip-top for your needs',
        ],
        typeSpeed: 50,
        backSpeed: 30,
        loop: true,
      });
  
      return () => {
        // Destroy Typed instance on unmount
        typedInstance.current.destroy();
      };
    }, []);
  
    return <span ref={elRef} />;
};

export default function HomeScreen(){
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const handleGetStarted = () => {
        if (!isLoaded) return;

        if (!user) {
            // If not logged in, redirect to sign up
            router.push('/auth/signUp');
            return;
        }

        const role = user.publicMetadata?.role;
        if (role === 'admin') {
            // If admin user, go to admin dashboard
            router.push('/dashboard/admin');
        } else if (role === 'paid') {
            // If paid user, go directly to text input
            router.push('/textInput');
        } else {
            // If free user, go to free dashboard
            router.push('/dashboard/free');
        }
    };

    return (
        <>
        <h1>Welcome to SmartLLM</h1>
        <Box><TypedComponent /></Box>
        <Paper elevation={0} sx={{ alignItems:'center', backgroundColor: 'transparent', boxShadow: 'none', marginTop:5}}>
          <Stack direction='row' spacing={2}>
            <Box sx={{alignItems:'center'}}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleGetStarted}
                >
                    Get Started
                </Button>
                <Button variant ="outlined" color="secondary" sx={{marginLeft: 2}}>Learn More</Button>
            </Box>
          </Stack>
        </Paper>
        </>
    );
}