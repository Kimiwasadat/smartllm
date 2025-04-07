'use client'
import React, {useEffect, useRef} from 'react';
import { Typed } from 'react-typed';
import {Button, Paper, Box} from '@mui/material'

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
        </>
    );
}