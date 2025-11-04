import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract data from request
    const { full_name, email, role, user_id, is_active, email_verified, created_at } = body;
    
    // YOUR GHL ENDPOINT LINK GOES HERE - Replace this URL with your actual GHL webhook URL
    const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/JxGt5Zz3odpUbS4vgmeC/webhook-trigger/85b78967-f390-4e00-9c99-1178c548fa72';
    
    // Prepare data for GHL
    const ghlData = {
      full_name,
      email,
      role,
      user_id,
      is_active,
      email_verified,
      created_at,
      // Add any additional fields your GHL webhook expects
      source: 'booking_hub_signup',
      timestamp: new Date().toISOString()
    };
    
    // Send data to GHL webhook
    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers your GHL webhook requires
        // 'Authorization': 'Bearer your-token',
        // 'X-API-Key': 'your-api-key',
      },
      body: JSON.stringify(ghlData),
    });
    
    if (ghlResponse.ok) {
      console.log('Signup data sent to GHL successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Data sent to GHL successfully' 
      });
    } else {
      console.error('GHL webhook failed:', ghlResponse.status, ghlResponse.statusText);
      return NextResponse.json({ 
        error: 'GHL webhook failed' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('GHL Signup Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process signup' 
    }, { status: 500 });
  }
}
