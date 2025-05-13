import { clerkClient } from '@clerk/nextjs/server';
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
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const plan = session.metadata?.plan || 'paid';

    // Update Clerk user metadata
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { role: plan }
      });
    } catch (err) {
      return NextResponse.json({ error: `Clerk update error: ${err.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
} 