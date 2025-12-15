import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Landlord form API route is working',
    status: 'ok' 
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('Received landlord form data:', data);
    
    // Replace this URL with your actual GHL webhook URL
    const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/JxGt5Zz3odpUbS4vgmeC/webhook-trigger/a9fffebf-ef21-4d6b-9a33-889c9b5a0dca';
    
    const ghlPayload = {
      full_name: data.full_name,
      company_name: data.company_name,
      email: data.email,
      phone: data.phone,
      number_of_properties: data.number_of_properties,
      main_locations: data.main_locations,
      property_types: data.property_types,
      source: 'booking_hub_landlord_form',
      timestamp: data.timestamp
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
      console.log('Landlord form data sent to GHL successfully. Response:', ghlResponseText);
      return NextResponse.json({ 
        success: true, 
        message: 'Landlord form data sent to GHL successfully',
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
    console.error('GHL Landlord Form Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process landlord form' 
    }, { status: 500 });
  }
}
