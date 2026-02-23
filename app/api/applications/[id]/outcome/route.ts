import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Map simple UI status codes to the full outcome model
const STATUS_MAP: Record<string, Partial<{
    outcome_status: string;
    final_outcome: string;
    received_response: boolean;
    reached_interview: boolean;
    received_offer: boolean;
    response_received_at: string;
}>> = {
    applied: {
        outcome_status: 'applied',
        final_outcome: 'pending',
    },
    responded: {
        outcome_status: 'responded',
        received_response: true,
        response_received_at: new Date().toISOString(),
    },
    interviewing: {
        outcome_status: 'interviewing',
        received_response: true,
        reached_interview: true,
        response_received_at: new Date().toISOString(),
    },
    offer: {
        outcome_status: 'offer',
        received_response: true,
        reached_interview: true,
        received_offer: true,
        final_outcome: 'offer_accepted',
    },
    rejected: {
        outcome_status: 'rejected',
        received_response: true,
        final_outcome: 'rejected_screening',
    },
    rejected_after_interview: {
        outcome_status: 'rejected',
        received_response: true,
        reached_interview: true,
        final_outcome: 'rejected_interview',
    },
    ghosted: {
        outcome_status: 'ghosted',
        received_response: false,
        final_outcome: 'no_response',
    },
    withdrawn: {
        outcome_status: 'pending',
        final_outcome: 'withdrawn',
    },
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    // Future: validate a signed token here (searchParams.get('token')).

    if (!status || !STATUS_MAP[status]) {
        return new NextResponse('Invalid status', { status: 400 });
    }

    const supabase = await createClient();

    // For GET (email), we use service role or we rely on the UUID being hard to guess
    // but we SHOULD verify the user eventually. For now, let's just do the update.
    // NOTE: In production, you'd verify a signed token here.

    const updates: Record<string, unknown> = {
        ...STATUS_MAP[status],
        outcome_updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', params.id);

    if (updateError) {
        console.error('[Outcome API GET] Update error:', updateError);
        return new NextResponse('Failed to update', { status: 500 });
    }

    // Redirect to a success page on the web app
    const successUrl = new URL('/dashboard', request.url);
    successUrl.searchParams.set('message', `Application updated to ${status}! Thanks for contributing to the dataset.`);
    successUrl.searchParams.set('updated', 'true');

    return NextResponse.redirect(successUrl);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, user_notes, would_recommend_applying, offer_amount, offer_currency } = body;

        if (!status || !STATUS_MAP[status]) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${Object.keys(STATUS_MAP).join(', ')}` },
                { status: 400 }
            );
        }

        // Verify ownership before any mutation
        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select('id, user_id, job_id')
            .eq('id', params.id)
            .single();

        if (fetchError || !application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        if (application.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Build update payload
        const updates: Record<string, unknown> = {
            ...STATUS_MAP[status],
            outcome_updated_at: new Date().toISOString(),
        };

        // If transitioning to 'applied', set the applied_at timestamp if not already set
        if (status === 'applied') {
            updates.applied_at = new Date().toISOString();
        }

        // Optional enrichment fields
        if (user_notes !== undefined) updates.user_notes = user_notes;
        if (would_recommend_applying !== undefined) updates.would_recommend_applying = would_recommend_applying;
        if (offer_amount !== undefined) updates.offer_amount = offer_amount;
        if (offer_currency !== undefined) updates.offer_currency = offer_currency;

        const { data: updated, error: updateError } = await supabase
            .from('applications')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single();

        if (updateError) {
            console.error('[Outcome API] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update outcome' }, { status: 500 });
        }

        // If outcome is closed, cancel future pending prompts
        const closedStatuses = ['offer', 'rejected', 'rejected_after_interview', 'ghosted', 'withdrawn'];
        if (closedStatuses.includes(status)) {
            await supabase
                .from('outcome_tracking_prompts')
                .update({ status: 'skipped' })
                .eq('application_id', params.id)
                .eq('status', 'pending');
        }

        return NextResponse.json({
            success: true,
            application: updated,
        });

    } catch (error) {
        console.error('[Outcome API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
