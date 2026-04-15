import { NextRequest, NextResponse } from 'next/server';
import { storeOTP } from '../verify-code/route';

// Simple rate limiting store (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function generateOTP(length = 6): string {
  return Math.random()
    .toString()
    .substring(2, 2 + length)
    .padStart(length, '0');
}

function checkRateLimit(email: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(email);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(email, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= maxAttempts) {
    return false;
  }

  existing.count += 1;
  return true;
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

    // Check rate limit
    if (!checkRateLimit(email, 5, 60000)) {
      return NextResponse.json(
        { message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit.' },
        { status: 429 }
      );
    }

    // Generate new OTP
    const code = generateOTP(6);
    storeOTP(email, code, 5); // 5 minutes expiry

    // In production, send email with OTP
    // For now, log it for development
    console.log(`[v0] OTP for ${email}: ${code}`);

    return NextResponse.json(
      {
        message: 'Kode verifikasi telah dikirim ulang',
        success: true,
        // Remove this in production - only for development
        ...(process.env.NODE_ENV === 'development' && { code })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Resend OTP error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
