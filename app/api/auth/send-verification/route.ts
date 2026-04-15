import { NextRequest, NextResponse } from 'next/server';
import { storeOTP } from '../verify-code/route';

function generateOTP(length = 6): string {
  return Math.random()
    .toString()
    .substring(2, 2 + length)
    .padStart(length, '0');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email harus diisi' },
        { status: 400 }
      );
    }

    // Generate OTP
    const code = generateOTP(6);
    storeOTP(email, code, 5); // 5 minutes expiry

    // In production, send email with OTP using service like SendGrid, Resend, etc.
    // For now, log it for development
    console.log(`[v0] OTP for ${email}: ${code}`);

    return NextResponse.json(
      {
        message: 'Kode verifikasi telah dikirim ke email Anda',
        success: true,
        // Remove this in production - only for development
        ...(process.env.NODE_ENV === 'development' && { code })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Send verification error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
