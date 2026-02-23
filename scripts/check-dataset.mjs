import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function getStats() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    async function query(path) {
        const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'count=exact'
            }
        });
        return res.headers.get('content-range')?.split('/')[1] || '0';
    }

    const appsCount = await query('applications?select=id&limit=1');
    const profilesCount = await query('profiles?select=id&limit=1');
    const cvsCount = await query('applications?generated_cv=not.is.null&select=id&limit=1');

    // Get top country
    const profilesRes = await fetch(`${supabaseUrl}/rest/v1/profiles?select=location&limit=100`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    const profiles = await profilesRes.json();
    const locations = profiles.map(p => p.location?.toLowerCase()).filter(Boolean);
    const topLocation = locations.sort((a, b) =>
        locations.filter(v => v === a).length - locations.filter(v => v === b).length
    ).pop() || 'Unknown';

    console.log('--- GHOSTJOB BASELINE ---');
    console.log(`- Vagas Analisadas: ${appsCount}`);
    console.log(`- Usuários Ativos:  ${profilesCount}`);
    console.log(`- CVs Criados:      ${cvsCount}`);
    console.log(`- Região Predom.:   ${topLocation}`);
    console.log('-------------------------');
}

getStats();
