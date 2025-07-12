import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
  const data = await request.json();

  const subject = data.subject || 'Untitled';
  const attachments = data.attachments || [];

  const imageUrl = attachments[0]?.url; // Resend gives you a URL
  const caption = subject;

  const { supabase } = await import('$lib/supabaseClient');

  await supabase.from('posts').insert([{ image_url: imageUrl, caption }]);

  return new Response('OK', { status: 200 });
}
