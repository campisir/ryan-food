import type { PageLoad } from './$types';
import { getSupabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
  const supabase = getSupabase();
  const collectionId = parseInt(params.id);
  
  if (isNaN(collectionId)) {
    throw error(404, 'Collection not found');
  }
  
  // Load collection details with profile information
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
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
    .eq('id', collectionId)
    .single();

  if (collectionError || !collection) {
    throw error(404, 'Collection not found');
  }

  // Load posts in this collection with profile information
  const { data: postCollections, error: postsError } = await supabase
    .from('post_collections')
    .select(`
      posts (
        id,
        image_url,
        caption,
        location,
        created_at,
        user_id,
        profiles (
          id,
          display_name,
          username,
          avatar_url,
          bio
        )
      )
    `)
    .eq('collection_id', collectionId);

  if (postsError) {
    console.error('Error loading collection posts:', postsError);
    return {
      collection,
      posts: []
    };
  }

  // Extract posts from the join result and sort by created_at
  const posts = postCollections?.map(pc => pc.posts).filter(Boolean) || [];
  posts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    collection,
    posts
  };
};
