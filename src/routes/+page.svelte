<script>
  export let data;
  $: posts = data?.posts || [];
  $: hasMore = data?.hasMore || false;
  $: totalCount = data?.totalCount || 0;
  
  // Animation delay for staggered entrance
  let mounted = false;
  import { onMount } from 'svelte';
  
  // Post info modal state
  let showPostInfo = false;
  let selectedPost = null;
  
  function openPostInfo(post) {
    selectedPost = post;
    showPostInfo = true;
  }
  
  function closePostInfo() {
    showPostInfo = false;
    selectedPost = null;
  }
  
  onMount(() => {
    mounted = true;
  });
</script>

<!-- Hero Section -->
<div class="text-center mb-8 animate-fade-in-up">
  <h2 class="text-2xl font-bold text-gray-900 mb-2">Delicious Moments</h2>
  <p class="text-gray-600">Discover amazing food experiences shared by our community</p>
</div>

{#if posts.length === 0}
  <!-- Empty state -->
  <div class="text-center py-16 animate-fade-in-up">
    <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center animate-pulse-slow">
      <span class="text-4xl">📸</span>
    </div>
    <h3 class="text-xl font-semibold text-gray-900 mb-3">No posts yet!</h3>
    <p class="text-gray-500 mb-6 max-w-md mx-auto">
      Start sharing your culinary adventures by sending photos to our email
    </p>
    <div class="bg-white rounded-lg border border-gray-200 p-4 max-w-sm mx-auto shadow-sm hover:shadow-md transition-shadow">
      <p class="text-sm text-gray-600 mb-2">Send photos to:</p>
      <p class="font-mono text-orange-500 font-medium">upload@ryan.food</p>
    </div>
  </div>
{:else}
  <!-- Posts feed -->
  <div class="space-y-8">
    {#each posts as post, index}
      <article 
        class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden food-card"
        class:animate-fade-in-up={mounted}
        style="animation-delay: {index * 100}ms"
      >
        <!-- Post header -->
        <div class="p-4 flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
            <span class="text-white font-bold text-sm">R</span>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-gray-900">Ryan Campisi</p>
            {#if post.location}
              <p class="text-sm text-gray-500 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
                {post.location}
              </p>
            {/if}
            {#if post.created_at}
              <p class="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            {/if}
          </div>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            on:click={() => openPostInfo(post)}
            title="View post info"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
            </svg>
          </button>
        </div>

        <!-- Post image -->
        {#if post.image_url}
          <div class="relative group">
            <img 
              src={post.image_url} 
              alt="Delicious food"
              class="w-full h-auto object-contain bg-gray-50 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <!-- Image overlay for better interaction -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        {/if}

        <!-- Post actions -->
        <div class="p-4">
          <div class="flex items-center space-x-6 mb-3">
            <button class="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors group">
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span class="text-sm font-medium">Like</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors group">
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <span class="text-sm font-medium">Comment</span>
            </button>
            <button class="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors group">
              <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              <span class="text-sm font-medium">Share</span>
            </button>
          </div>

          <!-- Post caption -->
          {#if post.caption}
            <div class="space-y-2">
              <p class="text-gray-800 leading-relaxed">
                <span class="font-semibold text-gray-900">Ryan Campisi</span>
                {post.caption}
              </p>
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>

  <!-- Load more placeholder - only show if there are more posts -->
  {#if hasMore}
    <div class="text-center mt-8 animate-fade-in-up">
      <button class="btn-primary">
        Load More Delicious Posts
      </button>
      <p class="text-sm text-gray-500 mt-2">
        Showing {posts.length} of {totalCount} posts
      </p>
    </div>
  {/if}
{/if}

<!-- Post Info Modal -->
{#if showPostInfo && selectedPost}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" on:click={closePostInfo}>
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden" on:click|stopPropagation>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Post Information</h3>
        <button 
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          on:click={closePostInfo}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="p-4 overflow-y-auto max-h-80">
        <div class="space-y-3">
          <!-- Quick Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-sm font-medium text-gray-500">Post ID:</span>
              <p class="text-gray-900">{selectedPost.id}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Created:</span>
              <p class="text-gray-900">
                {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleString() : 'Unknown'}
              </p>
            </div>
            {#if selectedPost.location}
              <div>
                <span class="text-sm font-medium text-gray-500">Location:</span>
                <p class="text-gray-900 flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  {selectedPost.location}
                </p>
              </div>
            {/if}
            <div>
              <span class="text-sm font-medium text-gray-500">Caption:</span>
              <p class="text-gray-900">{selectedPost.caption || 'No caption'}</p>
            </div>
          </div>
          
          <!-- JSON Data -->
          <div class="border-t border-gray-200 pt-4">
            <span class="text-sm font-medium text-gray-500 mb-2 block">Raw JSON Data:</span>
            <pre class="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border text-gray-800 font-mono">{JSON.stringify(selectedPost, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
