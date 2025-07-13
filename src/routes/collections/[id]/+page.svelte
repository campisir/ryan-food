<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: collection = data.collection;
  $: posts = data.posts;
  
  let selectedPost: any = null;
  let showModal = false;

  function openModal(post: any) {
    selectedPost = post;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedPost = null;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>{collection.name} - Collections - ryan.food</title>
</svelte:head>

<div class="space-y-6">
  <!-- Back Navigation -->
  <div class="flex items-center space-x-3">
    <a 
      href="/collections"
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
      <span>Back to Collections</span>
    </a>
  </div>

  <!-- Collection Header -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{collection.name}</h1>
        {#if collection.description}
          <p class="text-gray-600 mb-4">{collection.description}</p>
        {/if}
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <span>{posts.length} {posts.length === 1 ? 'photo' : 'photos'}</span>
          <span>Collection ID: {collection.id}</span>
          <span>Created {formatDate(collection.created_at)}</span>
        </div>
      </div>
      <div class="text-4xl">📚</div>
    </div>
  </div>

  <!-- Posts Grid -->
  {#if posts.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">📷</div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No photos in this collection yet</h3>
      <p class="text-gray-600 mb-4">Add photos to this collection by sending an email with the command:</p>
      <div class="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
        <code class="block bg-white px-3 py-2 rounded border text-orange-600">
          !addpostcollection POST_ID {collection.id}
        </code>
        <p class="text-xs text-gray-500 mt-2">Replace POST_ID with the ID of the post you want to add</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each posts as post}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <!-- Image -->
          <div class="aspect-square overflow-hidden cursor-pointer" on:click={() => openModal(post)}>
            <img 
              src={post.image_url} 
              alt={post.caption || 'Food photo'}
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
          
          <!-- Post Info -->
          <div class="p-4">
            {#if post.caption}
              <p class="text-gray-900 text-sm mb-2">{post.caption}</p>
            {/if}
            
            <div class="flex items-center justify-between text-xs text-gray-500">
              <div class="flex items-center space-x-2">
                {#if post.location}
                  <span class="flex items-center space-x-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                    <span>{post.location}</span>
                  </span>
                {/if}
              </div>
              <div class="flex items-center space-x-2">
                <span>ID: {post.id}</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal for full-size image -->
{#if showModal && selectedPost}
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" on:click={closeModal}>
    <div class="bg-white rounded-lg max-w-4xl max-h-full overflow-auto" on:click|stopPropagation>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Photo Details</h3>
        <button 
          on:click={closeModal}
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="p-4">
        <div class="max-w-2xl mx-auto">
          <img 
            src={selectedPost.image_url} 
            alt={selectedPost.caption || 'Food photo'}
            class="w-full rounded-lg"
          />
          
          <div class="mt-4 space-y-3">
            {#if selectedPost.caption}
              <div>
                <h4 class="font-medium text-gray-900 mb-1">Caption</h4>
                <p class="text-gray-700">{selectedPost.caption}</p>
              </div>
            {/if}
            
            {#if selectedPost.location}
              <div>
                <h4 class="font-medium text-gray-900 mb-1">Location</h4>
                <p class="text-gray-700 flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  <span>{selectedPost.location}</span>
                </p>
              </div>
            {/if}
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 class="font-medium text-gray-900 mb-1">Post ID</h4>
                <p class="text-gray-700">{selectedPost.id}</p>
              </div>
              <div>
                <h4 class="font-medium text-gray-900 mb-1">Created</h4>
                <p class="text-gray-700">{formatDate(selectedPost.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
