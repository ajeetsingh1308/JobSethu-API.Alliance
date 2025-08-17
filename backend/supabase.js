const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// This client uses the anonymous key and respects RLS policies.
// It's useful for public read operations or if we were building a serverless function.
const supabaseAnon = createClient(supabaseUrl, anonKey);

// This client uses the service role key, which has full admin access
// and bypasses RLS. This is what we'll use for our backend logic.
const supabaseServiceRole = createClient(supabaseUrl, serviceRoleKey);

module.exports = {
  supabaseAnon,
  supabaseServiceRole,
};