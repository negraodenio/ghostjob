import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as any, // Use any to bypass strict type check for now if local types are outdated
    appInfo: {
        name: 'GhostJob',
        version: '0.1.0',
    },
});

export const PLANS = {
    free: {
        name: 'Free',
        priceId: null,
        analysesLimit: 3,
    },
    pro: {
        name: 'Pro',
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        analysesLimit: Infinity,
    },
    premium: {
        name: 'Premium',
        priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        analysesLimit: Infinity,
    },
};

export async function createCheckoutSession(userId: string, userEmail: string, plan: 'pro' | 'premium', successUrl: string, cancelUrl: string) {
    const priceId = PLANS[plan].priceId;

    if (!priceId) {
        throw new Error(`Price ID for plan ${plan} is not configured`);
    }

    const session = await stripe.checkout.sessions.create({
        customer_email: userEmail,
        client_reference_id: userId,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
            plan,
        },
        subscription_data: {
            metadata: {
                userId,
                plan,
            },
        },
    });

    return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}
