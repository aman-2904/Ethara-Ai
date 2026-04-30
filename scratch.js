require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: users, error: userErr } = await supabase.from('users').select('*');
  console.log("Users:", users);
  
  const { data: projects, error: projErr } = await supabase.from('projects').select('*');
  console.log("Projects:", projects);
}
check();
