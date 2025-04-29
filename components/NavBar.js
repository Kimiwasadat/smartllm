'use client';              // MUI needs this

import { Button, Box, Paper, Stack, ButtonGroup, Link } from '@mui/material';
import { blue } from '@mui/material/colors';
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/600.css";
import { useRouter } from 'next/navigation';
export default function NavBar(){
  const router = useRouter();
    return(
      <Box>
      <Paper elevation={8} sx={{ bgcolor:' #1A1E2E',margin:3,padding:'0.5px'}}>
        <Stack direction="row">
        <Stack sx={{ml:3}}>
          <h2 style={{color:"#F9FAFB" }}>SmartLLM</h2>
        </Stack>
        <ButtonGroup variant="contained" 
        sx={{ml:5,'& .MuiButton-root': {
          color: 'common.white',                // white text
          border: 'none',                       // no outline
          '&:hover': {
            backgroundColor: 'transparent',     // kill blue hover tint
          },
          '&.Mui-focusVisible': {
            outline: 'none',                    // kill blue focus ring
          },
        },}}aria-label="navbar buttons">
        <Button variant="text" sx={{color: '#F9FAFB',}}>Features</Button>
        <Button variant="text" sx={{color: '#F9FAFB',}}>Review</Button>
        <Button variant="text" sx={{color: '#F9FAFB',}}>Pricing</Button>
    
        </ButtonGroup>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" sx={{justifyContent: 'flex-end', padding: "15px 10px"}}>
        <Button type="button" varaint="contained" size ="small" sx={{bgcolor: '#4F46E5', '&:hover': { bgcolor: '#689f38' }, color:"#F9FAFB", padding:"10px 16px"}} onClick={() => router.push('/auth/signUp')}>Sign Up</Button>
        <Button type="button" varaint="outlined"sx={{color:"#F9FAFB", padding:"9px 10px"}} onClick={() => router.push('/auth/signIn')}>Sign In</Button>
        </Stack>
        </Stack>
      </Paper>
      </Box>
    );
    }