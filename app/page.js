'use client';
import React from 'react';
import "@fontsource/inter";
import "@fontsource/inter/600.css";
import { Box } from  '@mui/material'
import HomeScreen from '@/components/HomeScreen'
import PricingScreen from '@/components/PricingScreen'
import DistinctFeatures from '@/components/DistinctFeatures'

export default function Home() {
  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <HomeScreen />
      <Box sx={{ position: 'relative', zIndex: 1, my: 8 }}>
        <DistinctFeatures />
      </Box>
      <Box sx={{ position: 'relative', zIndex: 1, my: 8 }}>
        <PricingScreen />
      </Box>
    </Box>
  );
}
