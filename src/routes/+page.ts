import { getSupabase } from '$lib/supabaseClient';

export async function load() {
  try {
    const supabase = getSupabase();
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { posts: [] };
    }

    return { posts: posts || [] };
  } catch (error) {
    console.error('Load function error:', error);
    return { posts: [] };
  }
}