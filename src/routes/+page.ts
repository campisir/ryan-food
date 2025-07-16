import { getSupabase } from '$lib/supabaseClient';

export async function load() {
  try {
    const supabase = getSupabase();
    const postsPerPage = 10; // Load 10 posts at a time
    
    // Get posts with pagination and profile information
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id,
          display_name,
          username,
          avatar_url,
          bio
        )
      `)
      .order('created_at', { ascending: false })
      .limit(postsPerPage);

    if (error) {
      console.error('Supabase error:', error);
      return { posts: [], hasMore: false };
    }

    // Check if there are more posts beyond what we loaded
    const { count: totalCount, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return { posts: posts || [], hasMore: false };
    }

    const hasMore = (totalCount || 0) > postsPerPage;

    return { 
      posts: posts || [], 
      hasMore,
      totalCount: totalCount || 0
    };
  } catch (error) {
    console.error('Load function error:', error);
    return { posts: [], hasMore: false };
  }
}