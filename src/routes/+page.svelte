<!-- src/routes/+page.svelte -->
<script>
  export let data;
  $: posts = data?.posts || [];
</script>

<h1 class="text-3xl mb-4">Ryan's Food Feed</h1>

{#if posts.length === 0}
  <p class="text-gray-500">No posts yet. Send an email to upload@ryan.food to add your first post!</p>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each posts as post}
      <div class="border p-4 rounded">
        {#if post.image_url}
          <img src={post.image_url} alt="food pic" class="rounded mb-2" />
        {/if}
        <p>{post.caption || 'No caption'}</p>
        {#if post.created_at}
          <small>{new Date(post.created_at).toLocaleString()}</small>
        {/if}
      </div>
    {/each}
  </div>
{/if}
