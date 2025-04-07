'use client';              // MUI needs this

import { Button, Box, Paper, Stack, ButtonGroup } from '@mui/material';
import { blue } from '@mui/material/colors';
import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/600.css";
export default function NavBar(){
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
        <Stack direction="row" sx={{justifyContent: 'flex-end' }}>
          <Button varaint="contained" size ="small" sx={{bgcolor: '#4F46E5', '&:hover': { bgcolor: '#689f38' }, color:"#F9FAFB", borderRadius: 999, padding:"2px 16px"}}>Sign Up</Button>
          <Button varaint="outlined"sx={{color:"#F9FAFB"}}>Sign In</Button>
        </Stack>
        </Stack>
      </Paper>
      </Box>
    );
    }