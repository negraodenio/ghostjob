import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = createAdminClient();

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;
            const plan = session.metadata?.plan;

            if (userId && plan) {
                // Update profile plan
                await supabase
                    .from('profiles')
                    .update({ plan: plan })
                    .eq('id', userId);

                // Insert/Update subscription record
                await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan: plan,
                        status: 'active',
                        current_period_end: new Date((session as any).expires_at * 1000).toISOString(), // Roughly
                    });
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const status = subscription.status;

            // Map Stripe status to our app status if necessary
            const internalStatus = status === 'active' ? 'active' : status === 'past_due' ? 'past_due' : 'cancelled';

            await supabase
                .from('subscriptions')
                .update({
                    status: internalStatus,
                    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
                })
                .eq('stripe_subscription_id', subscription.id);
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            // Reset profile plan to free
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('user_id')
                .eq('stripe_subscription_id', subscription.id)
                .single();

            if (subData?.user_id) {
                await supabase
                    .from('profiles')
                    .update({ plan: 'free' })
                    .eq('id', subData.user_id);
            }

            await supabase
                .from('subscriptions')
                .update({ status: 'cancelled' })
                .eq('stripe_subscription_id', subscription.id);
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
