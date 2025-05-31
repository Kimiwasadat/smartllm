'use client';              // MUI needs this

import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function NavBar() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const goToDashboard = () => {
    if (!isLoaded) return;
    const role = user?.publicMetadata?.role;
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else if (role === 'paid') {
      router.push('/dashboard/paid');
    } else if (role === 'free') {
      router.push('/dashboard/free');
    } else {
      router.push('/'); // or router.push('/auth/signIn');
    }
  };

  const goToTextEditor = () => {
    if (!isLoaded) return;
    if (user?.publicMetadata?.role === 'paid' || user?.publicMetadata?.role === 'free') {
      router.push('/textInput');
    } else if (user?.publicMetadata?.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/auth/signIn');
    }
  };

  return (
    <AppBar position="static" sx={{ background: '#1A1E2E', boxShadow: '0 2px 8px 0 rgba(31,41,55,0.06)', borderRadius: '10px', margin: '16px', width: 'calc(100% - 32px)' }}>
      <Toolbar>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, color: '#fff' }}>
          SmartLLM
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={() => router.push('/')}>Home</Button>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={goToDashboard}>Dashboard</Button>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={goToTextEditor}>Text Editor</Button>
          {isLoaded && (
            <>
              {user ? (
                <Box sx={{ ml: 2 }}>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: {
                          width: 40,
                          height: 40
                        }
                      }
                    }}
                  />
                </Box>
              ) : (
                <SignInButton mode="modal">
                  <Button 
                    variant="contained" 
                    sx={{ 
                      backgroundColor: '#6366F1', // Indigo-500
                      '&:hover': {
                        backgroundColor: '#4F46E5' // Indigo-600
                      },
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3
                    }}
                  >
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}