<script lang="ts">
  import { user, loading, signInWithEmail, signUpWithEmail, signOut, signInWithGoogle } from '../auth';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let isSignUp = false;
  let showDropdown = false;
  let authLoading = false;
  let authError = '';

  async function handleEmailAuth() {
    authLoading = true;
    authError = '';
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      email = '';
      password = '';
      showDropdown = false;
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message.includes('Invalid login credentials')) {
        authError = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        authError = 'Please check your email and confirm your account.';
      } else if (error.message.includes('User already registered')) {
        authError = 'An account with this email already exists.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        authError = 'Password must be at least 6 characters long.';
      } else {
        authError = isSignUp ? 'Failed to create account. Please try again.' : 'Failed to sign in. Please try again.';
      }
    } finally {
      authLoading = false;
    }
  }

  async function handleGoogleAuth() {
    authLoading = true;
    authError = '';
    try {
      await signInWithGoogle();
      showDropdown = false;
    } catch (error) {
      console.error('Google auth error:', error);
      authError = 'Failed to sign in with Google. Please try again.';
    } finally {
      authLoading = false;
    }
  }

  async function handleSignOut() {
    authLoading = true;
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      authLoading = false;
    }
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
    if (showDropdown) {
      authError = '';
    }
  }
</script>

<style>
  @keyframes bounce-in {
    0% {
      transform: scale(0.3) translateY(-20px);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) translateY(-5px);
      opacity: 0.8;
    }
    70% {
      transform: scale(0.9) translateY(0px);
      opacity: 0.9;
    }
    100% {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  .animate-bounce-in {
    animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  /* Floating bubbles animation */
  .floating-bubble {
    animation: float 4s ease-in-out infinite;
  }

  .floating-bubble:nth-child(2) {
    animation-delay: -1s;
  }

  .floating-bubble:nth-child(3) {
    animation-delay: -2s;
  }

  .floating-bubble:nth-child(4) {
    animation-delay: -3s;
  }
</style>

{#if $loading}
  <div class="animate-pulse bg-gray-300 h-10 w-24 rounded"></div>
{:else if $user}
  <div class="relative">
    <!-- User Button -->
    <button 
      on:click={toggleDropdown}
      class="group flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-lg px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
      disabled={authLoading}
    >
      <div class="w-6 h-6 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
        <span class="text-xs font-medium text-white">
          {($user.email || 'U')[0].toUpperCase()}
        </span>
      </div>
      <div class="flex-1 text-left min-w-0">
        <p class="text-sm font-medium text-white truncate">
          {$user.email || 'User'}
        </p>
      </div>
      <svg class="w-4 h-4 text-orange-100 transition-transform duration-200 group-hover:text-white" class:rotate-180={showDropdown} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
    
    {#if showDropdown}
      <!-- Invisible Backdrop -->
      <div 
        class="fixed inset-0 z-30"
        on:click={toggleDropdown}
      ></div>
      
      <!-- User Dropdown -->
      <div class="absolute right-0 mt-3 w-72 max-w-none bg-white rounded-xl shadow-xl border border-gray-200 z-40 overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-3 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
          <!-- Floating bubbles decoration -->
          <div class="absolute top-1 right-3 w-4 h-4 bg-white bg-opacity-20 rounded-full floating-bubble"></div>
          <div class="absolute bottom-1 left-4 w-3 h-3 bg-white bg-opacity-30 rounded-full floating-bubble"></div>
          <div class="absolute top-2 left-1/2 w-3 h-3 bg-white bg-opacity-15 rounded-full floating-bubble"></div>
          
          <div class="flex items-center space-x-3 relative z-10">
            <div class="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
              <span class="text-lg font-semibold text-white">
                {($user.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white text-sm truncate">{$user.email}</p>
              <p class="text-orange-100 text-xs">Online</p>
            </div>
          </div>
        </div>
        
        <!-- Menu Items -->
        <div class="p-3">
          <button 
            on:click={handleSignOut}
            class="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50"
            disabled={authLoading}
          >
            <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
            <div class="flex-1">
              <span class="font-medium text-sm">
                {authLoading ? 'Signing out...' : 'Sign out'}
              </span>
            </div>
            {#if authLoading}
              <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="relative">
    <!-- Sign In Button -->
    <button 
      on:click={toggleDropdown}
      class="group relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
      disabled={authLoading}
    >
      <div class="flex items-center space-x-2">
        <div class="w-5 h-5 rounded-full bg-white bg-opacity-25 flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="text-white text-sm">
          {authLoading ? 'Loading...' : 'Sign In'}
        </span>
      </div>
      <svg class="w-4 h-4 text-orange-100 transition-transform duration-200 group-hover:text-white" class:rotate-180={showDropdown} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    
    <!-- Elegant Dropdown -->
    {#if showDropdown}
      <!-- Invisible Backdrop -->
      <div 
        class="fixed inset-0 z-40"
        on:click={toggleDropdown}
      ></div>
      
      <!-- Dropdown Panel -->
      <div class="absolute right-0 mt-3 w-[480px] max-w-none bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
          <!-- Floating bubbles decoration -->
          <div class="absolute top-2 right-4 w-6 h-6 bg-white bg-opacity-20 rounded-full floating-bubble"></div>
          <div class="absolute bottom-2 left-6 w-4 h-4 bg-white bg-opacity-30 rounded-full floating-bubble"></div>
          <div class="absolute top-4 left-1/2 w-5 h-5 bg-white bg-opacity-15 rounded-full floating-bubble"></div>
          <div class="absolute bottom-1 right-1/3 w-3 h-3 bg-white bg-opacity-25 rounded-full floating-bubble"></div>
          
          <div class="flex items-center justify-between relative z-10">
            <div>
              <h3 class="text-lg font-semibold text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p class="text-orange-100 text-sm mt-1">
                {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
              </p>
            </div>
            <button 
              on:click={toggleDropdown}
              class="p-1.5 rounded-full hover:bg-white hover:bg-opacity-20 text-orange-100 hover:text-white transition-all duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Google Sign In Button -->
          <button
            on:click={handleGoogleAuth}
            disabled={authLoading}
            class="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 mb-4 disabled:opacity-50"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-gray-700 font-medium">Continue with Google</span>
          </button>
          
          <!-- Divider -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-3 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>
          
          <!-- Email Form -->
          <form on:submit|preventDefault={handleEmailAuth} class="space-y-4">
            {#if authError}
              <div class="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p class="text-red-600 text-sm">{authError}</p>
              </div>
            {/if}
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                bind:value={email}
                placeholder="Enter your email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-sm"
                disabled={authLoading}
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                bind:value={password}
                placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-sm"
                disabled={authLoading}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!email || !password || authLoading}
              class="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {#if authLoading}
                <div class="flex items-center justify-center space-x-2">
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </div>
              {:else}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              {/if}
            </button>
          </form>
          
          <!-- Toggle -->
          <div class="text-center mt-4 pt-4 border-t border-gray-200">
            <button
              on:click={() => {
                isSignUp = !isSignUp;
                authError = '';
              }}
              class="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200"
              disabled={authLoading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}