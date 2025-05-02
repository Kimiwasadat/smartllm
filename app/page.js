'use client';
import React from 'react';
import { Typed } from 'react-typed';
import Features from '@/components/DistinctFeatures';
import NavBar from '@/components/NavBar';
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/600.css";
import Image from "next/image";
import {Button, AppBar, Box, Paper, Stack} from  '@mui/material'
import HomeScreen from '@/components/HomeScreen'
import PricingScreen from '@/components/PricingScreen'
import DistinctFeatures from '@/components/DistinctFeatures'


export default function Home() {
  return (
    <>
    <NavBar />
      <Stack style={{alignItems:"center"}}>
        <HomeScreen />
        <DistinctFeatures />
        <PricingScreen />
      </Stack>
    
    </>
  );
}
