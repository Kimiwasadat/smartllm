'use client'
import React, {useEffect, useRef} from 'react';
import { Typed } from 'react-typed';
import {Button, Paper, Box, Stack} from '@mui/material'

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
    return (
        <>
        <h1>Welcome to SmartLLM</h1>
        <Box><TypedComponent /></Box>
        <Paper elevation={0} sx={{ alignItems:'center', backgroundColor: 'transparent', boxShadow: 'none', marginTop:5}}>
          <Stack direction='row' spacing={2}>
            <Box sx={{alignItems:'center'}}>
                <Button variant="contained" color="primary">Get Started</Button>
                <Button variant ="outlined" color="secondary" sx={{marginLeft: 2}}>Learn More</Button>
            </Box>
          </Stack>
        </Paper>
        
        </>
    );
}