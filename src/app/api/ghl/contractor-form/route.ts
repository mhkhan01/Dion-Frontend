import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const contractorData = await request.json();
    
    // Log the exact data received by GHL endpoint
    console.log('GHL endpoint received data:', {
      booking_date_id: contractorData.booking_date_id,
      booking_date_id_type: typeof contractorData.booking_date_id,
      booking_date_id_value: contractorData.booking_date_id,
      full_data: contractorData
    });
    
    // Replace this URL with your actual GHL endpoint
    const ghlEndpoint = 'https://services.leadconnectorhq.com/hooks/JxGt5Zz3odpUbS4vgmeC/webhook-trigger/5caf28bd-9145-4b99-b08c-be10afbbec5c';
    
    const response = await fetch(ghlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers your GHL endpoint requires
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
      },
      body: JSON.stringify(contractorData),
    });

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Data sent to GHL successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to send data to GHL' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GHL endpoint:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
