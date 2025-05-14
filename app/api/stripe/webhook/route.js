import { users } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const plan = session.metadata?.plan || 'paid';
    let tokensToAdd = 20; // default for free

    if (plan === 'paid') {
      tokensToAdd = Number(session.metadata?.tokens) || 0;
    }

    try {
      // Fetch current user to get existing tokens
      const user = await users.getUser(userId);
      const currentTokens = Number(user.publicMetadata?.tokens) || 0;
      const newTokenTotal = plan === 'paid' ? currentTokens + tokensToAdd : 20;

      console.log('Webhook: Updating Clerk user', userId, 'to role', plan, 'with tokens', newTokenTotal);

      const result = await users.updateUser(userId, {
        publicMetadata: { role: 'paid', tokens: newTokenTotal }
      });
      console.log('Webhook: Clerk user metadata update result:', result);
    } catch (err) {
      console.error('Webhook: Clerk update error:', err.message);
      return NextResponse.json({ error: `Clerk update error: ${err.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
} 