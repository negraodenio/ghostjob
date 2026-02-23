
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- SECTORS ---');
    const { data: sectors, error: err1 } = await supabase.from('view_industry_transparency_reports').select('*');
    if (err1) console.error('Error fetching sectors:', err1);
    else console.log(JSON.stringify(sectors, null, 2));

    console.log('--- RANKINGS ---');
    const { data: rankings, error: err2 } = await supabase.from('view_anonymized_rankings').select('*');
    if (err2) console.error('Error fetching rankings:', err2);
    else console.log(JSON.stringify(rankings, null, 2));

    console.log('--- COMPANIES ---');
    const { data: companies, error: err3 } = await supabase.from('companies').select('id, name, industry, total_jobs_posted, total_applications_received').limit(10);
    if (err3) console.error('Error fetching companies:', err3);
    else console.log(JSON.stringify(companies, null, 2));

    console.log('--- JOBS ---');
    const { count: jobCount, error: err4 } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    if (err4) console.error('Error fetching jobs:', err4);
    else console.log('Total jobs:', jobCount);
}

checkData();
