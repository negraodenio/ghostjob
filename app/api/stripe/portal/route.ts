import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get customer ID from subscriptions table
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!subscription?.stripe_customer_id) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
        }

        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const returnUrl = `${baseUrl}/dashboard`;

        const session = await createPortalSession(subscription.stripe_customer_id, returnUrl);

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Stripe Portal Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
