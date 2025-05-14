import Stripe from 'stripe';

// Only initialize Stripe on the server side
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

export const TOKEN_PACKAGES = {
  BASIC: {
    id: 'price_1ROVXdRouHBm6ei9KJgW02rk',
    name: 'Basic Package',
    tokens: 1000,
    price: 10,
    description: '1,000 tokens for basic text editing'
  },
  PREMIUM: {
    id: 'price_1ROVYeRouHBm6ei9xK1OgXLx',
    name: 'Premium Package',
    tokens: 5000,
    price: 45,
    description: '5,000 tokens for extensive text editing'
  },
  
}; 