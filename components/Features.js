'use client'
import {Box, Paper, Button, Stack, Typography, Card} from '@mui/material'
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/600.css";
import Image from 'next/image'
import { useState } from 'react'

export default function Features(){
    <>
    <Stack direction="row" spacing={2} sx={{justifyContent:'center', marginTop:5}}> 
        <Card sx={{width: '10%', height: '10%', backgroundColor: '#F9FAFB', padding: 2, marginTop: 5}}>
            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#1A1E2E', textAlign: 'center'}}>Features</Typography>
        </Card>
        <Card sx={{width: '10%', height: '10%', backgroundColor: '#F9FAFB', padding: 2, marginTop: 5}}>
            <Typography variant="h4" sx={{fontWeight: 'bold', color: '#1A1E2E', textAlign: 'center'}}>Features</Typography> 
        </Card>
    </Stack>
    </>
}