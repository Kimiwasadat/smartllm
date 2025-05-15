import { users } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  console.log('[WEBHOOK] Received request');
  
  const sig = req.headers.get('stripe-signature');
  console.log('[WEBHOOK] Signature:', sig ? 'Present' : 'Missing');
  
  const rawBody = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('[WEBHOOK] Event constructed successfully:', event.type);
  } catch (err) {
    console.error('[WEBHOOK] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    console.log('[WEBHOOK] Processing checkout.session.completed');
    const session = event.data.object;
    console.log('[WEBHOOK] Session data:', {
      userId: session.client_reference_id,
      metadata: session.metadata,
      amount: session.amount_total
    });

    const userId = session.client_reference_id;
    if (!userId) {
      console.error('[WEBHOOK] No user ID in session');
      return NextResponse.json({ error: 'No user ID in session' }, { status: 400 });
    }

    const plan = session.metadata?.plan || 'paid';
    let tokensToAdd = 20; // default for free

    if (plan === 'paid') {
      tokensToAdd = Number(session.metadata?.tokens) || 0;
      console.log('[WEBHOOK] Tokens to add:', tokensToAdd);
    }

    try {
      // Fetch current user to get existing tokens and metadata
      const user = await users.getUser(userId);
      console.log('[WEBHOOK] Current user metadata:', user.publicMetadata);

      const currentTokens = Number(user.publicMetadata?.tokens) || 0;
      const oldMetadata = user.publicMetadata || {};
      const newTokenTotal = plan === 'paid' ? currentTokens + tokensToAdd : 20;
      
      // Increment initialTokensPurchased
      const previousInitial = Number(oldMetadata.initialTokensPurchased) || 0;
      const newInitial = previousInitial + tokensToAdd;
      
      console.log('[WEBHOOK] Token calculation:', {
        currentTokens,
        tokensToAdd,
        newTokenTotal
      });

      const newMetadata = {
        ...oldMetadata,
        role: 'paid',
        tokens: newTokenTotal,
        initialTokensPurchased: newInitial
      };

      await users.updateUser(userId, {
        publicMetadata: newMetadata
      });
      console.log('[WEBHOOK] Clerk user metadata updated:', newMetadata);

      // Verify the update
      const updatedUser = await users.getUser(userId);
      console.log('[WEBHOOK] Verification - Updated user metadata:', updatedUser.publicMetadata);

      return NextResponse.json({ 
        success: true, 
        message: 'Tokens updated successfully',
        metadata: updatedUser.publicMetadata 
      });

    } catch (err) {
      console.error('[WEBHOOK] Clerk update error:', err.message);
      return NextResponse.json({ error: `Clerk update error: ${err.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
} 