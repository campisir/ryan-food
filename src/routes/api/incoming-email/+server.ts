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
    
    console.log('Processing subject:', subject);

    // Parse location from subject (format: @location@)
    let location = null;
    let remainingSubject = subject as string;
    
    const locationMatch = remainingSubject.match(/^@([^@]+)@/);
    if (locationMatch) {
      location = locationMatch[1];
      remainingSubject = remainingSubject.replace(/^@[^@]+@\s*/, '');
      console.log('Extracted location:', location);
      console.log('Remaining subject after location:', remainingSubject);
    }

    // Check for commands at the beginning of the (remaining) subject
    const deleteMatch = remainingSubject.match(/^!deletepost\s+(\d+)/);
    const updateMatch = remainingSubject.match(/^!updatepost\s+(\d+)\s+\$(\w+)\s+(.+)/);

    // Get Supabase client for commands
    const { getSupabase } = await import('$lib/supabaseClient');
    const supabase = getSupabase();

    // Handle delete command
    if (deleteMatch) {
      const postId = parseInt(deleteMatch[1]);
      console.log('Delete command detected for post ID:', postId);

      // First, get the post to find the image URL for cleanup
      const { data: postToDelete, error: fetchError } = await supabase
        .from('posts')
        .select('image_url')
        .eq('id', postId)
        .single();

      if (fetchError || !postToDelete) {
        console.log('Post not found for deletion:', postId);
        return new Response(JSON.stringify({
          success: true,
          message: 'Post not found, no action taken',
          timestamp: new Date().toISOString()
        }), { 
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      }

      // Delete the post from database
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return new Response(JSON.stringify({
          error: 'Delete failed',
          details: {
            message: deleteError.message,
            error: deleteError,
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

      // Optionally delete the image from storage
      if (postToDelete.image_url) {
        const fileName = postToDelete.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('food-photos')
            .remove([fileName]);
          console.log('Deleted image file:', fileName);
        }
      }

      console.log('Post deleted successfully:', postId);
      return new Response(JSON.stringify({
        success: true,
        message: 'Post deleted successfully',
        data: { postId, timestamp: new Date().toISOString() }
      }), { 
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle update command
    if (updateMatch) {
      const postId = parseInt(updateMatch[1]);
      const attribute = updateMatch[2];
      const value = updateMatch[3];
      
      console.log('Update command detected:', { postId, attribute, value });

      // Validate attribute (only allow certain fields)
      const allowedAttributes = ['caption', 'location'];
      if (!allowedAttributes.includes(attribute)) {
        console.log('Invalid attribute for update:', attribute);
        return new Response(JSON.stringify({
          success: true,
          message: 'Invalid attribute, no action taken',
          timestamp: new Date().toISOString()
        }), { 
          status: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });
      }

      // Update the post
      const updateData: any = {};
      updateData[attribute] = value;

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(JSON.stringify({
          error: 'Update failed',
          details: {
            message: updateError.message,
            error: updateError,
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

      console.log('Post updated successfully:', { postId, attribute, value });
      return new Response(JSON.stringify({
        success: true,
        message: 'Post updated successfully',
        data: { postId, attribute, value, timestamp: new Date().toISOString() }
      }), { 
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
    }

    // If no commands, proceed with normal post creation
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
    }

    // If no attachment and no commands, skip this email
    if (!imageUrl) {
      console.log('No attachments found and no commands, skipping email');
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

    const caption = remainingSubject; // Use the remaining subject after location parsing

    // Only insert into database if we have an image URL
    if (imageUrl) {
      const { error } = await supabase.from('posts').insert([{ 
        image_url: imageUrl, 
        caption,
        location
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

      console.log('Post created successfully:', { imageUrl, caption, location });
    }

    return new Response(JSON.stringify({
      success: true,
      message: imageUrl ? 'Post created successfully' : 'No attachments found',
      data: {
        imageUrl,
        caption,
        location,
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
