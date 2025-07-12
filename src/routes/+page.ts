import { supabase } from '$lib/supabaseClient';

export async function load() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return { posts };
}