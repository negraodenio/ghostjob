
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: companies, error } = await supabase.from('companies').select('name, industry, total_applications_received');
    if (error) console.error(error);
    else console.log(JSON.stringify(companies, null, 2));
}

checkData();
