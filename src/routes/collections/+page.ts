import type { PageLoad } from './$types';
import { getSupabase } from '$lib/supabaseClient';

export const load: PageLoad = async () => {
  const supabase = getSupabase();
  
  // Load collections with post count
  const { data: collections, error } = await supabase
    .from('collections')
    .select(`
      *,
      post_collections(
        posts(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading collections:', error);
    return {
      collections: []
    };
  }

  // Process collections to add post count and preview images
  const processedCollections = collections?.map(collection => ({
    ...collection,
    postCount: collection.post_collections?.length || 0,
    previewImages: collection.post_collections
      ?.slice(0, 4)
      .map((pc: any) => pc.posts.image_url)
      .filter(Boolean) || []
  })) || [];

  return {
    collections: processedCollections
  };
};
