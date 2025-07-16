import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
  // For now, let the client handle auth state
  // This prevents server/client mismatch issues
  return {
    url: url.pathname
  };
};
