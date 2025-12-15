import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  console.log('=== Booking Request API Called ===');
  
  try {
    const body = await request.json();
    console.log('Request body parsed successfully');
    const {
      fullName,
      companyName,
      email,
      phone,
      projectPostcode,
      password,
      bookings,
      teamSize,
      budgetPerPerson,
      city
    } = body;

    console.log('Received booking request data:', {
      fullName,
      companyName,
      email,
      phone,
      projectPostcode,
      bookings,
      teamSize,
      budgetPerPerson,
      city
    });

    // Step 0: Validate email doesn't exist in contractor or landlord tables (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check contractor table
    const { data: contractorsForValidation, error: contractorCheckError } = await supabaseServer
      .from('contractor')
      .select('id, email');

    if (contractorCheckError) {
      console.error('Error checking contractor table:', contractorCheckError);
      return NextResponse.json(
        { error: 'This email is already in use, Try a different email.' },
        { status: 400 }
      );
    }

    if (contractorsForValidation && Array.isArray(contractorsForValidation)) {
      const existingContractor = contractorsForValidation.find(
        (c) => {
          if (!c || !c.email) return false;
          const dbEmail = String(c.email).toLowerCase().trim();
          return dbEmail === normalizedEmail;
        }
      );
      if (existingContractor) {
        console.log('Email already exists in contractor table:', normalizedEmail);
        return NextResponse.json(
          { error: 'This email is already in use, Try a different email.' },
          { status: 400 }
        );
      }
    }

    // Check landlord table
    const { data: existingLandlords, error: landlordCheckError } = await supabaseServer
      .from('landlord')
      .select('id, email');

    if (landlordCheckError) {
      console.error('Error checking landlord table:', landlordCheckError);
      return NextResponse.json(
        { error: 'This email is already in use, Try a different email.' },
        { status: 400 }
      );
    }

    if (existingLandlords && Array.isArray(existingLandlords)) {
      const existingLandlord = existingLandlords.find(
        (l) => {
          if (!l || !l.email) return false;
          const dbEmail = String(l.email).toLowerCase().trim();
          return dbEmail === normalizedEmail;
        }
      );
      if (existingLandlord) {
        console.log('Email already exists in landlord table:', normalizedEmail);
        return NextResponse.json(
          { error: 'This email is already in use, Try a different email.' },
          { status: 400 }
        );
      }
    }

    // Step 1: Create Supabase Auth account
    // Try using admin API if service role key is available
    let authData;
    let authError;
    
    const hasServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY && 
                              process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (hasServiceRoleKey) {
      // Use admin API with service role - use normalized email for consistency
      const result = await supabaseServer.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: false,
        user_metadata: {
          role: 'contractor',
          full_name: fullName
        }
      });
      authData = result.data;
      authError = result.error;
    } else {
      // Fallback to regular signup - use normalized email for consistency
      const result = await supabaseServer.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contractor`,
          data: {
            role: 'contractor',
            full_name: fullName
          }
        }
      });
      authData = result.data;
      authError = result.error;
    }

    if (authError) {
      console.error('Auth signup error:', authError);
      // Check if error is related to duplicate email
      if (authError.message.includes('duplicate') || 
          authError.message.includes('email') || 
          authError.message.includes('unique constraint') ||
          authError.message.includes('already exists') ||
          authError.message.includes('email address is already registered')) {
        return NextResponse.json(
          { error: 'This email is already in use, Try a different email.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Step 2: Generate unique contractor code
    // Get all existing contractor codes to find the next available number
    const { data: existingContractors, error: fetchError } = await supabaseServer
      .from('contractor')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: false });

    let nextNumber = 1;
    
    if (existingContractors && existingContractors.length > 0) {
      // Extract numbers from existing codes (e.g., "CT-5" -> 5)
      const existingNumbers = existingContractors
        .map((c: any) => {
          const code = c?.code;
          if (!code) return 0;
          const match = String(code).match(/CT-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
      
      if (existingNumbers.length > 0) {
        // Find the maximum number and add 1
        nextNumber = Math.max(...existingNumbers) + 1;
      }
    }

    const contractorCode = `CT-${nextNumber}`;
    console.log('Generated contractor code:', contractorCode);

    // Step 3: Create contractor profile in contractor table - use normalized email
    const { data: contractorData, error: contractorError } = await supabaseServer
      .from('contractor')
      .insert({
        id: authData.user.id,
        email: normalizedEmail,
        full_name: fullName,
        company_name: companyName,
        company_email: normalizedEmail,
        phone: phone,
        code: contractorCode,
        role: 'contractor',
        is_active: true,
        email_verified: false
      })
      .select()
      .single();

    if (contractorError) {
      console.error('Error creating contractor profile:', contractorError);
      // Check if error is related to duplicate email
      if (contractorError.message.includes('duplicate') || 
          contractorError.message.includes('email') || 
          contractorError.message.includes('unique constraint') ||
          contractorError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already in use, Try a different email.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create contractor profile: ${contractorError.message}` },
        { status: 500 }
      );
    }

    console.log('Contractor profile created successfully:', contractorData);

    // Step 3: Create booking request - use normalized email
    const { data: bookingRequest, error: requestError } = await supabaseServer
      .from('booking_requests')
      .insert({
        user_id: authData.user.id,
        full_name: fullName,
        company_name: companyName,
        email: normalizedEmail,
        project_postcode: projectPostcode,
        team_size: teamSize,
        budget_per_person_week: budgetPerPerson,
        status: 'pending',
        city: city
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating booking request:', requestError);
      return NextResponse.json(
        { error: `Failed to create booking request: ${requestError.message}` },
        { status: 500 }
      );
    }

    console.log('Booking request created successfully:', bookingRequest);

    // Step 4: Create booking dates for each booking
    let datesData: any[] = [];
    if (bookings && bookings.length > 0) {
      const bookingDates = bookings
        .filter((booking: any) => booking.startDate && booking.endDate)
        .map((booking: any) => {
          // Ensure dates are in proper format and start_date is before end_date
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          
          // Validate that start_date is before end_date
          if (startDate >= endDate) {
            throw new Error(`Invalid date range: start date ${booking.startDate} must be before end date ${booking.endDate}`);
          }
          
          return {
            booking_request_id: bookingRequest.id,
            start_date: booking.startDate,
            end_date: booking.endDate
          };
        });

      console.log('Preparing to insert booking dates:', bookingDates);

      if (bookingDates.length > 0) {
        const { data: createdDates, error: datesError } = await supabaseServer
          .from('booking_dates')
          .insert(bookingDates)
          .select();

        if (datesError) {
          console.error('Error creating booking dates:', datesError);
          console.error('Booking dates data that failed:', bookingDates);
          console.error('Error details:', {
            message: datesError.message,
            details: datesError.details,
            hint: datesError.hint,
            code: datesError.code
          });
          return NextResponse.json(
            { error: `Failed to create booking dates: ${datesError.message}. Details: ${datesError.details || 'No additional details'}` },
            { status: 500 }
          );
        }

        datesData = createdDates || [];
        console.log('Booking dates created successfully:', datesData);
      }
    }

    console.log('All operations completed successfully');
    
    return NextResponse.json(
      { 
        success: true, 
        contractor: contractorData,
        bookingRequest,
        bookingDates: datesData || [],
        message: 'Account created and booking request submitted successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('=== Error processing booking request ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
