import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    const supabase = createAdminClient();

    try {
        // 1. Fetch pending prompts that are due
        // Using nested selection to get app and job details
        const { data: prompts, error: fetchError } = await supabase
            .from('outcome_tracking_prompts')
            .select(`
                id,
                prompt_type,
                application_id,
                applications:application_id (
                    user_id,
                    job:job_id (
                        job_title,
                        company:company_id (
                            name
                        )
                    )
                )
            `)
            .eq('status', 'pending')
            .lte('scheduled_for', new Date().toISOString());

        if (fetchError) throw fetchError;

        if (!prompts || prompts.length === 0) {
            return NextResponse.json({ message: 'No prompts to process' });
        }

        const notificationResults = [];

        for (const prompt of prompts) {
            const app: any = prompt.applications;
            if (!app) continue;

            const jobName = app.job?.job_title || 'a recent application';
            const companyName = app.job?.company?.name || 'the company';

            let title = 'How did it go?';
            let message = `It's been a few days since you applied to ${jobName} at ${companyName}. Have you heard back?`;

            if (prompt.prompt_type === 'followup_14d') {
                title = 'Still waiting?';
                message = `Any news on your application for ${jobName}? Updating your outcome helps others know if ${companyName} is hiring.`;
            } else if (prompt.prompt_type === 'final_30d') {
                title = 'Final Outcome Check';
                message = `It's been 30 days. If you haven't heard from ${companyName}, it might be a "Ghost". Help us verify by updating your status.`;
            }

            // 2. Create Notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: app.user_id,
                    application_id: prompt.application_id,
                    title,
                    message,
                    type: 'outcome_check',
                    action_url: `/applications/${prompt.application_id}`
                });

            if (!notifError) {
                // 3. Update Prompt Status
                await supabase
                    .from('outcome_tracking_prompts')
                    .update({
                        status: 'sent',
                        sent_at: new Date().toISOString()
                    })
                    .eq('id', prompt.id);

                notificationResults.push({ id: prompt.id, status: 'success' });
            } else {
                notificationResults.push({ id: prompt.id, status: 'error', error: notifError });
            }
        }

        return NextResponse.json({
            processed: prompts.length,
            results: notificationResults
        });

    } catch (error: any) {
        console.error('Error processing prompts:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
