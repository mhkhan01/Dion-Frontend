import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('Received landlord signup data:', data);
    
    // Replace this URL with your actual GHL webhook URL for landlord signup
    const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/JxGt5Zz3odpUbS4vgmeC/webhook-trigger/AfWYCS4fmaIw2J0yjh2M';
    
    const ghlPayload = {
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      user_id: data.user_id,
      is_active: data.is_active,
      email_verified: data.email_verified,
      created_at: data.created_at,
      source: 'booking_hub_landlord_signup',
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending to GHL:', ghlPayload);
    
    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghlPayload),
    });
    
    console.log('GHL Response status:', ghlResponse.status);
    console.log('GHL Response ok:', ghlResponse.ok);
    
    if (ghlResponse.ok) {
      const ghlResponseText = await ghlResponse.text();
      console.log('Landlord signup data sent to GHL successfully. Response:', ghlResponseText);
      return NextResponse.json({ 
        success: true, 
        message: 'Landlord signup data sent to GHL successfully',
        ghlResponse: ghlResponseText
      });
    } else {
      const errorText = await ghlResponse.text();
      console.error('GHL responded with error:', ghlResponse.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to send data to GHL: ${ghlResponse.status} - ${errorText}` 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('GHL Landlord Signup Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process landlord signup' 
    }, { status: 500 });
  }
}
