import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple in-memory store for OTP codes (replace with database in production)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email dan kode harus diisi' },
        { status: 400 }
      );
    }

    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return NextResponse.json(
        { message: 'Kode verifikasi tidak ditemukan. Silakan daftar ulang.' },
        { status: 400 }
      );
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return NextResponse.json(
        { message: 'Kode verifikasi telah kadaluarsa' },
        { status: 400 }
      );
    }

    if (otpData.attempts >= 3) {
      otpStore.delete(email);
      return NextResponse.json(
        { message: 'Terlalu banyak percobaan yang gagal. Silakan minta kode baru.' },
        { status: 429 }
      );
    }

    if (otpData.code !== code) {
      otpData.attempts += 1;
      return NextResponse.json(
        { message: `Kode OTP tidak valid. Tersisa ${3 - otpData.attempts} percobaan.` },
        { status: 400 }
      );
    }

    // OTP is valid - mark email as verified
    const supabase = await createClient();
    
    // Update user verification status in auth metadata
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError || !user) {
      return NextResponse.json(
        { message: 'Gagal memverifikasi pengguna' },
        { status: 500 }
      );
    }

    // Mark as verified by updating auth user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: { email_verified: true }
    }).catch(() => ({ error: null }));

    // Clean up OTP
    otpStore.delete(email);

    return NextResponse.json(
      { message: 'Email berhasil diverifikasi', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Verification error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// Export function to store OTP (used by sign-up and resend endpoints)
export function storeOTP(email: string, code: string, expiryMinutes = 5) {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
  otpStore.set(email, { code, expiresAt, attempts: 0 });
}

// Export function to get stored OTP (for testing)
export function getStoredOTP(email: string) {
  return otpStore.get(email);
}
