import {AppBar,  Container,Toolbar, Typography, Button, Grid, Paper, Stack, Link, Box} from '@mui/material' 
import {SignIn} from '@clerk/nextjs'
export default function SignInPage() {
    return <Container maxWidth="lg" sx={{paddingTop: 10}}>
        <AppBar postion="static" sx={{backgroundColor: '#1A1E2E', padding: 2}}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> SmartLLM</Typography>
                <Link href='/signUp' sx={{bgcolor: '#4F46E5', '&:hover': { bgcolor: '#689f38' }, color:"#F9FAFB", borderRadius:0, padding:"2px 16px"}} passHref><Button varaint="contained" sx={{ color:"#F9FAFB", borderRadius:0, }}>Sign Up</Button></Link>
                <Link href='/signIn' passhref="true"><Button varaint="outlined"sx={{color:"#F9FAFB"}}>Sign In</Button></Link>
            </Toolbar>
        </AppBar>
            <Link href='/signUp' passhref="true"><Button varaint="outlined"sx={{color:"#F9FAFB"}}>Sign Up</Button></Link>
            <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="h4" sx={{fontWeight: 'italics', color: '3c3c3c', mt:5}}>Sign In</Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', mt: "30px"}}>
                <SignIn />
            </Box>
        
        </Container>
}   