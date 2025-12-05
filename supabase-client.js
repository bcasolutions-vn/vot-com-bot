require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Singleton Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
