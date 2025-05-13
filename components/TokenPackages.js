'use client';
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { TOKEN_PACKAGES } from '@/lib/stripe';

// Initialize Stripe on the client side
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export default function TokenPackages() {
  const [loading, setLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Check if Stripe is available
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeLoaded(true);
    }
  }, []);

  const handlePurchase = async (packageId) => {
    if (!stripeLoaded) {
      console.error('Stripe is not loaded');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!stripeLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} justifyContent="center">
      {Object.values(TOKEN_PACKAGES).map((pkg) => (
        <Grid item xs={12} sm={6} md={4} key={pkg.id}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {pkg.name}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                ${pkg.price}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {pkg.tokens.toLocaleString()} Tokens
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {pkg.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Purchase Now'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 