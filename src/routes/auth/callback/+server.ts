import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  
  if (code) {
    // This would be handled by the client-side auth flow
    // For now, just redirect to home
    throw redirect(303, '/');
  }
  
  // If no code, redirect to home with error
  throw redirect(303, '/?error=auth_failed');
};
