const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('academy_members').select('id, batch_members(batches(id, name))').limit(1);
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error(error);
}
test();
