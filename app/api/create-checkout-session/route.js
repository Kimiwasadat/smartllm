import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const { userId } = auth();
    console.log('DEBUG: userId in create-checkout-session:', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await req.json();
    const packageInfo = Object.values(TOKEN_PACKAGES).find(pkg => pkg.id === packageId);
    
    if (!packageInfo) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: packageInfo.name,
              description: packageInfo.description,
            },
            unit_amount: packageInfo.price * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/paid?success=true&tokens=${packageInfo.tokens}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/free?canceled=true`,
      metadata: {
        userId,
        packageId,
        tokens: packageInfo.tokens,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
} 