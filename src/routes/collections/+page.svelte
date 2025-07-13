<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: collections = data.collections;
</script>

<svelte:head>
  <title>Collections - ryan.food</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page Header -->
  <div class="text-center">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">📚 Collections</h1>
    <p class="text-gray-600">Organize your food memories into curated collections</p>
  </div>

  <!-- How to create collections -->
  <div class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
    <h2 class="text-lg font-semibold text-gray-900 mb-2">✨ Create Collections via Email</h2>
    <p class="text-gray-700 mb-2">Send an email to <span class="font-mono bg-white px-2 py-1 rounded text-orange-600">upload@ryan.food</span> with commands:</p>
    <div class="bg-white rounded-md p-3 font-mono text-sm">
      <div class="text-gray-600">📧 Subject examples:</div>
      <div class="mt-1 space-y-1">
        <div><span class="text-orange-600">!addcollection *Japan 2023* Summer food adventure</span></div>
        <div><span class="text-orange-600">!addpostcollection 1 2</span> <span class="text-gray-500">(add post 1 to collection 2)</span></div>
        <div><span class="text-orange-600">!deletecollection 3</span> <span class="text-gray-500">(delete collection 3)</span></div>
      </div>
    </div>
  </div>

  <!-- Collections Grid -->
  {#if collections.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">📚</div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No collections yet</h3>
      <p class="text-gray-600 mb-4">Start organizing your food photos by creating your first collection!</p>
      <div class="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
        <p class="text-sm text-gray-700">Send an email with subject:</p>
        <code class="block mt-2 bg-white px-3 py-2 rounded border text-orange-600">
          !addcollection *My First Collection* Description here
        </code>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each collections as collection}
        <a 
          href="/collections/{collection.id}"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 block group"
        >
          <!-- Collection Preview -->
          <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
            {#if collection.previewImages.length > 0}
              {#if collection.previewImages.length === 1}
                <img 
                  src={collection.previewImages[0]} 
                  alt="Collection preview"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              {:else if collection.previewImages.length === 2}
                <div class="grid grid-cols-2 h-full">
                  {#each collection.previewImages.slice(0, 2) as image}
                    <img 
                      src={image} 
                      alt="Collection preview"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  {/each}
                </div>
              {:else if collection.previewImages.length >= 3}
                <div class="grid grid-cols-2 h-full">
                  <img 
                    src={collection.previewImages[0]} 
                    alt="Collection preview"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div class="grid grid-rows-2">
                    <img 
                      src={collection.previewImages[1]} 
                      alt="Collection preview"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div class="relative">
                      <img 
                        src={collection.previewImages[2]} 
                        alt="Collection preview"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {#if collection.previewImages.length > 3}
                        <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span class="text-white font-bold text-lg">+{collection.previewImages.length - 3}</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="text-4xl mb-2">📁</div>
                  <p class="text-gray-500 text-sm">Empty collection</p>
                </div>
              </div>
            {/if}
            
            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div class="bg-white bg-opacity-90 rounded-full p-3">
                  <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Collection Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors duration-200">{collection.name}</h3>
            {#if collection.description}
              <p class="text-gray-600 text-sm mb-2">{collection.description}</p>
            {/if}
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>{collection.postCount} {collection.postCount === 1 ? 'photo' : 'photos'}</span>
              <span>ID: {collection.id}</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Additional styles for better preview layout */
  .grid img {
    transition: transform 0.2s ease;
  }
  
  .grid img:hover {
    transform: scale(1.05);
  }
</style>
