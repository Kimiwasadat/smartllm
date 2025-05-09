'use client'
import {Box, Paper, Button, Stack, Typography, Card, Grid, Item} from '@mui/material'
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/600.css";
import Image from 'next/image'
import { useState } from 'react'
import CommentIcon from '@mui/icons-material/Comment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import KeyIcon from '@mui/icons-material/Key';


export default function DistinctFeatures(){
   return  (
   <>
     <Grid container spacing={2} sx={{ marginTop: 5, marginLeft: 5 }}>
      <Grid item xs={6} md={8}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CommentIcon />
          <Typography>Have access to unlimited AI typing with our integrated AI editing feature.</Typography>
        </Card>
      </Grid>

      <Grid item xs={6} md={8}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleAltIcon />
          <Typography>Collaborate your work with other people and return back to the text you've been working on.</Typography>
        </Paper>
      </Grid>

      <Grid item xs={6} md={8}>
        <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <KeyIcon />
          <Typography>AI text editing while also being affordable.</Typography>
        </Paper>
      </Grid>
    </Grid>
    </>
   );
} 