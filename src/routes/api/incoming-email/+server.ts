import type { RequestEvent } from '@sveltejs/kit';

export async function GET() {
  return new Response('Incoming email webhook endpoint. Use POST method.', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST({ request }: RequestEvent) {
  try {
    // Set CORS headers for webhook endpoint
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Mailgun sends form data, not JSON
    const formData = await request.formData();
    
    // Log the incoming data for debugging
    console.log('Received webhook from Mailgun');
    
    // Extract email data from Mailgun's format
    const subject = formData.get('Subject') || formData.get('subject') || 'Untitled';
    const attachmentCount = parseInt(formData.get('attachment-count') as string) || 0;
    
    let imageUrl = null;
    
    // Look for the first attachment
    if (attachmentCount > 0) {
      const attachment1 = formData.get('attachment-1');
      if (attachment1 instanceof File) {
        // You'll need to upload this to a storage service
        // For now, we'll log that we received an attachment
        console.log('Received attachment:', attachment1.name, attachment1.type);
        
        // TODO: Upload to Supabase Storage or another service
        // For now, we'll skip posts with attachments until you set up file storage
        return new Response('Attachment received but file storage not implemented yet', { 
          status: 200,
          headers
        });
      }
    } else {
      // No attachment, skip this email
      console.log('No attachments found, skipping email');
      return new Response('No attachments found', { 
        status: 200,
        headers
      });
    }

    const caption = subject as string;

    const { getSupabase } = await import('$lib/supabaseClient');
    const supabase = getSupabase();

    const { error } = await supabase.from('posts').insert([{ 
      image_url: imageUrl, 
      caption 
    }]);

    if (error) {
      console.error('Supabase error:', error);
      return new Response('Database error', { 
        status: 500,
        headers
      });
    }

    return new Response('OK', { 
      status: 200,
      headers
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}
