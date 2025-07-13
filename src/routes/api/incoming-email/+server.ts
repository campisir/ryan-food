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
        console.log('Received attachment:', attachment1.name, attachment1.type);
        
        // Get Supabase client
        const { getSupabase } = await import('$lib/supabaseClient');
        const supabase = getSupabase();
        
        // Generate a unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}-${attachment1.name}`;
        
        // Convert File to ArrayBuffer for upload
        const fileBuffer = await attachment1.arrayBuffer();
        
        // Upload to Supabase Storage
        console.log('Attempting to upload file:', fileName, 'Size:', fileBuffer.byteLength, 'Type:', attachment1.type);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('food-photos')
          .upload(fileName, fileBuffer, {
            contentType: attachment1.type,
            upsert: false
          });
        
        if (uploadError) {
          const errorDetails = {
            message: uploadError.message,
            error: uploadError,
            fileName,
            fileSize: fileBuffer.byteLength,
            contentType: attachment1.type,
            timestamp: new Date().toISOString()
          };
          console.error('Upload error details:', errorDetails);
          return new Response(JSON.stringify({
            error: 'File upload failed',
            details: errorDetails
          }), { 
            status: 500,
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            }
          });
        }
        
        console.log('Upload successful:', uploadData);
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('food-photos')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
        console.log('File uploaded successfully:', imageUrl);
      }
    } else {
      // No attachment, skip this email
      console.log('No attachments found, skipping email');
      return new Response(JSON.stringify({
        success: true,
        message: 'No attachments found',
        timestamp: new Date().toISOString()
      }), { 
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }

    const caption = subject as string;

    // Only insert into database if we have an image URL
    if (imageUrl) {
      const { getSupabase } = await import('$lib/supabaseClient');
      const supabase = getSupabase();

      const { error } = await supabase.from('posts').insert([{ 
        image_url: imageUrl, 
        caption 
      }]);

      if (error) {
        console.error('Supabase error:', error);
        return new Response(JSON.stringify({
          error: 'Database error',
          details: {
            message: error.message,
            error: error,
            timestamp: new Date().toISOString()
          }
        }), { 
          status: 500,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Post created successfully with image:', imageUrl);
    }

    return new Response(JSON.stringify({
      success: true,
      message: imageUrl ? 'Post created successfully' : 'No attachments found',
      data: {
        imageUrl,
        caption,
        timestamp: new Date().toISOString()
      }
    }), { 
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      }
    });
  }
}
