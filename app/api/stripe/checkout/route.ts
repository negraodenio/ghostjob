import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { plan } = await req.json();

        if (!['pro', 'premium'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const successUrl = `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`;
        const cancelUrl = `${baseUrl}/pricing?payment=cancelled`;

        const session = await createCheckoutSession(
            user.id,
            user.email!,
            plan as 'pro' | 'premium',
            successUrl,
            cancelUrl
        );

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
