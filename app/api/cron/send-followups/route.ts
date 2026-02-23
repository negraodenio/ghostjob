import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resend } from '@/lib/resend';
import { FollowUpEmail } from '@/components/emails/FollowUpEmail';

export const dynamic = 'force-dynamic';

// This endpoint should be secured via a secret token in production
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Find users who have applications needing a follow-up
    // Rules:
    // 1. applied_at is 7, 14, or 30 days ago
    // 2. final_outcome is 'pending'
    // 3. received_response is NULL
    // 4. No follow-up was sent yet for this interval

    // For simplicity in this first version, we'll fetch applications applied_at exactly n days ago
    const intervals = [7, 14, 30];
    const now = new Date();

    const results = [];

    for (const days of intervals) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - days);

        // Format to YYYY-MM-DD for comparison with applied_at date
        const dateStr = targetDate.toISOString().split('T')[0];

        // Note: In a real DB we'd use date truncation or range. 
        // Here we assume applied_at timestamp is used.
        const { data: apps, error } = await supabase
            .from('applications')
            .select(`
        id,
        job_title,
        company_name,
        user_id
      `)
            .is('received_response', null)
            .eq('final_outcome', 'pending')
            // This is a simple check, in reality we'd need a last_prompt_at or similar to avoid duplicates
            .gte('applied_at', `${dateStr}T00:00:00`)
            .lte('applied_at', `${dateStr}T23:59:59`);

        if (error) {
            console.error(`Error fetching apps for interval ${days}:`, error);
            continue;
        }

        if (!apps || apps.length === 0) continue;

        for (const app of apps) {
            // Fetch user email via Admin Client (since we can't join auth.users directly easily)
            const { data: { user: authUser }, error: userError } = await supabaseAdmin.auth.admin.getUserById(app.user_id);

            if (userError || !authUser?.email) {
                console.error(`Could not fetch email for user ${app.user_id}:`, userError);
                continue;
            }

            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'noreply@ghostproof.cv',
                    to: authUser.email,
                    subject: `Quick check-in: How is your application at ${app.company_name}?`,
                    react: FollowUpEmail({
                        jobTitle: app.job_title,
                        companyName: app.company_name,
                        applicationId: app.id,
                        userName: authUser.user_metadata?.full_name || 'there',
                        daysSinceApplied: days,
                    }),
                });

                results.push({ id: app.id, status: 'sent', interval: days });
            } catch (err) {
                console.error(`Failed to send email for app ${app.id}:`, err);
                results.push({ id: app.id, status: 'error', error: err });
            }
        }
    }

    return NextResponse.json({ processed: results.length, details: results });
}
