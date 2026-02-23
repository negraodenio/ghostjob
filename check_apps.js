
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data, error } = await supabase.from('applications').select('outcome_status');
    if (error) {
        console.error(error);
        return;
    }

    const counts = data.reduce((acc, curr) => {
        acc[curr.outcome_status] = (acc[curr.outcome_status] || 0) + 1;
        return acc;
    }, {});

    console.log('Outcome Status Counts:', counts);
}

checkData();
