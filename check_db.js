import { supabase } from './src/supabase.js';

async function checkDb() {
  console.log("=== CHECKING USERS ===");
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error reading profiles:", error);
  } else {
    console.log("Profiles in DB:", profiles);
  }
}
checkDb();
