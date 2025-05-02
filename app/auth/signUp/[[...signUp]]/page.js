'use client'
import {AppBar,  Container,Toolbar, Typography, Button, Grid, Paper, Stack, Link,Box} from '@mui/material' 
import {SignUp} from '@clerk/nextjs'
import { useRouter } from 'next/navigation';

export default function SignInPage({plan, setPlan}) {
    const router = useRouter();
    return <Container maxWidth="lg" sx={{paddingTop: 10}}>
        <AppBar position="static" sx={{backgroundColor: '#1A1E2E', padding: 2}}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> SmartLLM</Typography>
                <Button type="button" onClick={() => router.push('/auth/signUp')} variant="contained" sx={{ color:"#F9FAFB", borderRadius:0, }}>Sign Up</Button>
                <Button type="button"  variant="outlined"sx={{color:"#F9FAFB"}} onClick={() => router.push('/auth/signIn')}>Sign In</Button>
            
            </Toolbar>
            </AppBar>
            <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="h4" sx={{fontWeight: 'italics', color: '#3c3c3c', mt:5}}>Sign Up</Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', mt: "30px"}}>
                <SignUp afterSignUpUrl={`/auth/finishSignup?role=${plan}`}  />
            </Box>
        
        </Container>
}       