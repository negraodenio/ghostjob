import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    plan: 'free' | 'pro' | 'premium' | 'anonymous';
    message?: string;
}

const RATE_LIMITS = {
    anonymous: 5, // 5 per hour
    free: 3,      // 3 per month
    pro: Infinity,  // unlimited
    premium: Infinity, // unlimited
};

export async function checkRateLimit(userId?: string): Promise<RateLimitResult> {
    const supabase = await createClient();

    // 1. Authenticated User Logic (Existing)
    if (userId) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('plan, analyses_count, analyses_reset_at')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            return { allowed: true, remaining: RATE_LIMITS.free, plan: 'free' };
        }

        const plan = profile.plan as 'free' | 'pro' | 'premium';
        const limit = RATE_LIMITS[plan];

        if (limit === Infinity) return { allowed: true, remaining: Infinity, plan };

        // Reset Logic for Free Plan
        const resetAt = profile.analyses_reset_at ? new Date(profile.analyses_reset_at) : null;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let currentCount = profile.analyses_count || 0;

        if (!resetAt || resetAt < thirtyDaysAgo) {
            await supabase
                .from('profiles')
                .update({ analyses_count: 0, analyses_reset_at: now.toISOString() })
                .eq('id', userId);
            currentCount = 0;
        }

        const allowed = currentCount < limit;
        return {
            allowed,
            remaining: Math.max(0, limit - currentCount),
            plan,
            message: allowed ? undefined : `You've reached your ${plan} plan limit of ${limit} analyses per month. Upgrade to Pro for unlimited access.`
        };
    }

    // 2. Anonymous User Logic (IP-based)
    const ip = headers().get('x-forwarded-for') || 'unknown';

    // Check rate_limits table
    // Note: This requires the service role key ideally, but we are in a server context.
    // However, createClient uses the user's session.
    // The rate_limits table has RLS enabled but no policies for anon.
    // We strictly need a way to read/write this table.
    // If createClient scopes to anon, RLS blocks us.
    // We need a Service Role client here OR open RLS for anon (bad).
    // Let's assume we can use the current client if we relax RLS for anon INSERT/UPDATE but strict SELECT?
    // Actually, creating a service client is safer for system operations.
    // But we don't have createAdminClient easily available in this file structure without Env vars verify.
    // Let's attempt to use the existing client but with RLS Policies that allow "anon" to Insert/Update based on IP?
    // No, IP spoofing is trivial if we trust the client.
    // 
    // CORRECT APPROACH: Use a Service Role client for this operation.
    // I need to start a new client using SUPABASE_SERVICE_ROLE_KEY.

    // Check if we have the key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        console.warn('Missing SUPABASE_SERVICE_ROLE_KEY, skipping IP rate limit check.');
        return { allowed: true, remaining: RATE_LIMITS.anonymous, plan: 'anonymous' };
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );

    const { data: record } = await adminClient
        .from('rate_limits')
        .select('*')
        .eq('ip_address', ip)
        .single();

    const now = new Date();

    if (!record) {
        // Create new record
        await adminClient.from('rate_limits').insert({
            ip_address: ip,
            // Initialize new record
            request_count: 0,
            last_request_at: now.toISOString(),
            expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1 hour
        });
        return { allowed: true, remaining: RATE_LIMITS.anonymous, plan: 'anonymous' };
    }

    // Check expiration
    if (new Date(record.expires_at) < now) {
        // Expired, reset
        await adminClient.from('rate_limits').update({
            request_count: 0,
            expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
        }).eq('ip_address', ip);

        return { allowed: true, remaining: RATE_LIMITS.anonymous, plan: 'anonymous' };
    }

    // Check limit
    const allowed = record.request_count < RATE_LIMITS.anonymous;
    return {
        allowed,
        remaining: Math.max(0, RATE_LIMITS.anonymous - record.request_count),
        plan: 'anonymous',
        message: allowed ? undefined : `Anonymous limit reached (${RATE_LIMITS.anonymous}/hour). Please sign in for more.`
    };
}

export async function incrementAnalysisCount(userId?: string): Promise<void> {
    // 1. Authenticated
    if (userId) {
        const supabase = await createClient();
        const { data: profile } = await supabase.from('profiles').select('analyses_count').eq('id', userId).single();
        const currentCount = profile?.analyses_count || 0;
        await supabase.from('profiles').update({ analyses_count: currentCount + 1 }).eq('id', userId);
        return;
    }

    // 2. Anonymous (IP-based)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return;

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

    const ip = headers().get('x-forwarded-for') || 'unknown';

    // We assume record exists because checkRateLimit was called first.
    // But to be safe, we Upsert.
    const { data: record } = await adminClient.from('rate_limits').select('request_count').eq('ip_address', ip).single();

    if (record) {
        await adminClient
            .from('rate_limits')
            .update({ request_count: record.request_count + 1, last_request_at: new Date().toISOString() })
            .eq('ip_address', ip);
    } else {
        // Should have been created in check, but fallback
        await adminClient.from('rate_limits').insert({
            ip_address: ip,
            request_count: 1,
            last_request_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        });
    }
}
