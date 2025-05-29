'use client';              // MUI needs this

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function NavBar() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const goToDashboard = () => {
    if (!isLoaded) return;
    if (user?.publicMetadata?.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard');
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={() => router.push('/')}>Home</Button>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={goToDashboard}>Dashboard</Button>
          <Button color="inherit" sx={{ color: '#fff' }} onClick={goToTextEditor}>Text Editor</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}