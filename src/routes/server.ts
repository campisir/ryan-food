import type { RequestEvent } from '@sveltejs/kit';

export async function GET() {
  return new Response('Mailgun webhook endpoint. Use POST method.', { 
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
    console.log("📬 Mailgun webhook called at /");

    // Mailgun sends form data, not JSON
    const formData = await request.formData();
    
    // Log all form data for debugging
    console.log("🧾 Form data received:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Check what type of event this is
    const eventType = formData.get('event-data') ? 'notify' : 'store';
    console.log(`📧 Event type: ${eventType}`);

    if (eventType === 'store') {
      // This is a "store" event - email with attachments for processing
      console.log("📁 Processing store event (email with attachments)");
      
      const subject = formData.get('Subject') || formData.get('subject') || 'Untitled';
      const from = formData.get('From') || formData.get('from') || 'Unknown sender';
      const attachmentCount = parseInt(formData.get('attachment-count') as string) || 0;
      
      console.log(`📝 Subject: ${subject}`);
      console.log(`👤 From: ${from}`);
      console.log(`📎 Attachments: ${attachmentCount}`);

      // Here you could forward this to your /api/incoming-email endpoint
      // or process it directly
      
      return new Response(JSON.stringify({
        success: true,
        message: "Store event received",
        data: {
          eventType,
          subject,
          from,
          attachmentCount,
          timestamp: new Date().toISOString()
        }
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });

    } else if (eventType === 'notify') {
      // This is a "notify" event - email delivery status notification
      console.log("📊 Processing notify event (delivery status)");
      
      const eventDataStr = formData.get('event-data') as string;
      let eventData = null;
      
      try {
        eventData = JSON.parse(eventDataStr);
        console.log("📋 Event data:", eventData);
      } catch (e) {
        console.error("❌ Failed to parse event data:", e);
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Notify event received", 
        data: {
          eventType,
          eventData,
          timestamp: new Date().toISOString()
        }
      }), { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Unknown event type
    return new Response(JSON.stringify({
      success: true,
      message: "Unknown event type received",
      data: {
        eventType: 'unknown',
        timestamp: new Date().toISOString()
      }
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error("❌ Error processing Mailgun webhook:", error);
    return new Response(JSON.stringify({
      error: "Webhook processing failed",
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}