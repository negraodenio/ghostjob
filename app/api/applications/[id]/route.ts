import { NextRequest, NextResponse } from 'next/server';
// createClient removed as we use admin client

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminSupabase = createAdminClient();

        const { data: application, error } = await adminSupabase
            .from('applications')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !application) {
            return NextResponse.json(
                { error: 'Analysis not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error('[API] Error fetching application:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
