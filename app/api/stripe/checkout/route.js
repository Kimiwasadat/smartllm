import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TOKEN_PACKAGES } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Optional but recommended
});

export async function POST(req) {
  try {
    const { userId } = await auth();
    console.log('[CHECKOUT] Creating session for user:', userId);

    if (!userId) {
      console.error('[CHECKOUT] No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();
    console.log('[CHECKOUT] Price ID received:', priceId);

    if (!priceId) {
      console.error('[CHECKOUT] No price ID provided');
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Find the token amount for the selected package
    const pkg = Object.values(TOKEN_PACKAGES).find(pkg => pkg.id === priceId);
    const tokens = pkg ? pkg.tokens : 0;
    console.log('[CHECKOUT] Package details:', { package: pkg, tokens });

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/refresh?redirect=/textInput`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: {
        plan: 'paid',
        tokens: tokens.toString() // Ensure tokens is a string
      },
    });

    console.log('[CHECKOUT] Session created:', {
      sessionId: session.id,
      metadata: session.metadata,
      successUrl: session.success_url,
      clientReferenceId: session.client_reference_id
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[CHECKOUT] Error creating session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
