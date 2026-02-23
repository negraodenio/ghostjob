import Stripe from 'stripe';

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

// Lazy singleton — only instantiated when a key is present (avoids build-time crash)
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY is not configured.');
        }
        _stripe = new Stripe(key, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiVersion: '2025-01-27.acacia' as any,
            appInfo: { name: 'GhostJob', version: '0.1.0' },
        });
    }
    return _stripe;
}

export { getStripe };

// Keep named export for routes that already import `stripe` directly
export const stripe = {
    webhooks: {
        constructEvent: (body: string, sig: string, secret: string) =>
            getStripe().webhooks.constructEvent(body, sig, secret),
    },
};

export async function createCheckoutSession(
    userId: string,
    userEmail: string,
    plan: 'pro' | 'premium',
    successUrl: string,
    cancelUrl: string
) {
    const priceId = PLANS[plan].priceId;
    if (!priceId) throw new Error(`Price ID for plan ${plan} is not configured`);

    const s = getStripe();
    const session = await s.checkout.sessions.create({
        customer_email: userEmail,
        client_reference_id: userId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId, plan },
        subscription_data: { metadata: { userId, plan } },
    });
    return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
    const s = getStripe();
    const session = await s.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return session;
}
