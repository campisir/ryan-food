<script lang="ts">
  import { user } from '$lib/auth';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let profile = null;
  let loading = true;
  let saving = false;
  let error = '';
  let success = '';

  // Form fields
  let displayName = '';
  let username = '';
  let bio = '';
  let avatarUrl = '';

  onMount(async () => {
    if (!$user) {
      goto('/');
      return;
    }
    
    await loadProfile();
  });

  async function loadProfile() {
    try {
      loading = true;
      error = '';

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', $user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      if (data) {
        profile = data;
        displayName = data.display_name || '';
        username = data.username || '';
        bio = data.bio || '';
        avatarUrl = data.avatar_url || '';
      } else {
        // Profile doesn't exist, we'll create one when they save
        profile = null;
      }
    } catch (err) {
      error = 'Failed to load profile';
      console.error('Error loading profile:', err);
    } finally {
      loading = false;
    }
  }

  async function saveProfile() {
    try {
      saving = true;
      error = '';
      success = '';

      const profileData = {
        id: $user.id,
        display_name: displayName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString()
      };

      if (profile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', $user.id);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (insertError) throw insertError;
      }

      success = 'Profile saved successfully!';
      await loadProfile(); // Reload to get the updated data
    } catch (err) {
      error = 'Failed to save profile';
      console.error('Error saving profile:', err);
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Profile - ryan.food</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 bg-gradient-to-r from-orange-400 to-red-500 relative overflow-hidden">
      <!-- Floating bubbles decoration -->
      <div class="absolute top-2 right-4 w-6 h-6 bg-white bg-opacity-20 rounded-full animate-float"></div>
      <div class="absolute bottom-2 left-6 w-4 h-4 bg-white bg-opacity-30 rounded-full animate-float" style="animation-delay: -1s;"></div>
      <div class="absolute top-4 left-1/2 w-5 h-5 bg-white bg-opacity-15 rounded-full animate-float" style="animation-delay: -2s;"></div>
      
      <div class="flex items-center space-x-4 relative z-10">
        <div class="w-16 h-16 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
          {#if avatarUrl}
            <img src={avatarUrl} alt="Profile" class="w-full h-full rounded-full object-cover" />
          {:else}
            <span class="text-2xl font-bold text-white">
              {($user?.email || 'U')[0].toUpperCase()}
            </span>
          {/if}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">Your Profile</h1>
          <p class="text-orange-100">Manage your account information</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      {#if loading}
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-10 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-10 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-20 bg-gray-200 rounded"></div>
        </div>
      {:else}
        <form on:submit|preventDefault={saveProfile} class="space-y-6">
          {#if error}
            <div class="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p class="text-red-600 text-sm">{error}</p>
            </div>
          {/if}

          {#if success}
            <div class="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p class="text-green-600 text-sm">{success}</p>
            </div>
          {/if}

          <!-- Email (read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={$user?.email || ''}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              disabled
            />
            <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <!-- Display Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              bind:value={displayName}
              placeholder="Your display name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              disabled={saving}
            />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              bind:value={username}
              placeholder="@username"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              disabled={saving}
            />
            <p class="text-xs text-gray-500 mt-1">Choose a unique username</p>
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              bind:value={bio}
              placeholder="Tell us about yourself..."
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 resize-none"
              disabled={saving}
            ></textarea>
          </div>

          <!-- Avatar URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
            <input
              type="url"
              bind:value={avatarUrl}
              placeholder="https://example.com/avatar.jpg"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              disabled={saving}
            />
            <p class="text-xs text-gray-500 mt-1">Link to your profile picture</p>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end space-x-3 pt-4">
            <a 
              href="/"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={saving}
              class="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {#if saving}
                <div class="flex items-center space-x-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </div>
              {:else}
                Save Profile
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
</style>
