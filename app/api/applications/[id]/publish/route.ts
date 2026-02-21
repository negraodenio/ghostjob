import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const supabase = await createClient();

        // 1. Authenticate user to make sure they own the application
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch the application to verify ownership
        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        if (application.user_id && application.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Mark as public
        const { error: updateError } = await supabase
            .from('applications')
            .update({ is_public: true })
            .eq('id', id);

        if (updateError) {
            console.error('[API] Error publishing:', updateError);
            return NextResponse.json({ error: 'Failed to publish to Ghost Wall' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[API] Publish error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
