const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // This would be your 'service_role' key

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;