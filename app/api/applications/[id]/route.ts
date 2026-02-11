import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();

        const { data: application, error } = await supabase
            .from('applications')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !application) {
            return NextResponse.json(
                { error: 'Application not found' },
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
