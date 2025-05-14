'use client';
import TokenPackages from '../../../components/TokenPackages';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Box, Paper, Typography, Button, Grid, Card, CardContent } from '@mui/material';

export default function PaidDashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const tokens = user?.publicMetadata?.tokens ?? 0;

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        🚀 Paid User Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome to your exclusive paid dashboard!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: '#4F46E5', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Token Balance
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {tokens}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)">
                Tokens available for text editing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Premium Features
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Advanced AI capabilities</li>
              <li>Priority support</li>
              <li>Unlimited usage</li>
            </ul>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Purchase More Tokens
        </Typography>
        <TokenPackages />
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ px: 5, py: 2, fontSize: '1.1rem', borderRadius: 2 }}
          onClick={() => router.push('/textInput')}
        >
          Go to Text Input
        </Button>
      </Box>
    </Box>
  );
}
