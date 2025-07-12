<!-- src/routes/+page.svelte -->
<script>
  export let data;
</script>

<h1 class="text-3xl mb-4">Ryan's Food Feed</h1>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each data.posts as post}
    <div class="border p-4 rounded">
      <img src={post.image_url} alt="food pic" class="rounded mb-2" />
      <p>{post.caption}</p>
      <small>{new Date(post.created_at).toLocaleString()}</small>
    </div>
  {/each}
</div>
