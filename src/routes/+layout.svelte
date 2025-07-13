<script>
  import '../app.css';
  import { page } from '$app/stores';
</script>

<!-- Modern social media layout -->
<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">🍽️</span>
        </div>
        <h1 class="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          ryan.food
        </h1>
      </div>

      <!-- User info -->
      <div class="flex items-center space-x-3">
        <div class="hidden sm:block text-right">
          <p class="text-sm font-medium text-gray-900">Ryan Campisi</p>
          <p class="text-xs text-gray-500">Food Explorer</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
          <span class="text-white font-bold text-sm">R</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="max-w-4xl mx-auto px-4">
      <nav class="flex space-x-8 border-b border-gray-200" aria-label="Tabs">
        <a 
          href="/" 
          class="py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {$page.url.pathname === '/' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          📸 Feed
        </a>
        <a 
          href="/collections" 
          class="py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {$page.url.pathname === '/collections' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          📚 Collections
        </a>
      </nav>
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-4xl mx-auto px-4 py-6">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 mt-12">
    <div class="max-w-4xl mx-auto px-4 py-6 text-center">
      <p class="text-gray-500 text-sm">
        📧 Send photos to <span class="font-medium text-orange-500">upload@ryan.food</span> to share your delicious moments
      </p>
    </div>
  </footer>
</div>
