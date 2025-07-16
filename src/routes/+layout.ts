import { initAuth } from '$lib/auth';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  // Initialize auth without server session data
  // This will properly restore from localStorage/cookies
  await initAuth();
  
  return {};
};
