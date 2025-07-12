<!-- src/routes/+page.svelte -->
<script>
  export let data;
  $: posts = data?.posts || [];
</script>

<h1 class="text-3xl font-bold mb-8 text-gray-900">Ryan's Food Feed</h1>

{#if posts.length === 0}
  <div class="text-center py-12">
    <p class="text-gray-500 text-lg">No posts yet. Send an email to upload@ryan.food to add your first post!</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each posts as post}
      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
        {#if post.image_url}
          <div class="aspect-square overflow-hidden bg-gray-100">
            <img 
              src={post.image_url} 
              alt="food pic" 
              class="w-full h-full object-cover"
            />
          </div>
        {/if}
        <div class="p-4">
          <p class="text-gray-800 text-sm mb-2 leading-relaxed">{post.caption || 'No caption'}</p>
          {#if post.created_at}
            <small class="text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</small>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
