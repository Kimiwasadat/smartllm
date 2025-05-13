import Stripe from 'stripe';

// Only initialize Stripe on the server side
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

export const TOKEN_PACKAGES = {
  BASIC: {
    id: 'price_basic',
    name: 'Basic Package',
    tokens: 1000,
    price: 10,
    description: '1,000 tokens for basic text editing'
  },
  PREMIUM: {
    id: 'price_premium',
    name: 'Premium Package',
    tokens: 5000,
    price: 45,
    description: '5,000 tokens for extensive text editing'
  },
  UNLIMITED: {
    id: 'price_unlimited',
    name: 'Unlimited Package',
    tokens: 10000,
    price: 80,
    description: '10,000 tokens for unlimited text editing'
  }
}; 