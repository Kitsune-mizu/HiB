'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthError } from '@/components/auth/auth-error';
import { Clock } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputs = Array(length).fill(0);

  const handleChange = (index, val) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newValue = value.split('');
    newValue[index] = val;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    // Auto focus next input
    if (val && index < length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {inputs.map((_, index) => (
        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-12 text-center text-2xl font-bold border-2 border-white rounded-lg focus:outline-none focus:border-red-600 transition-colors"
        />
      ))}
    </div>
  );
};

const CountdownTimer = ({ expiryTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

      setTimeLeft(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <Clock className="w-4 h-4" />
      <span>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTime] = useState(Date.now() + 5 * 60 * 1000); // 5 minutes

  useEffect(() => {
    if (isExpired && !canResend) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isExpired, canResend]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Kode verifikasi tidak valid');
        setOtp('');
        return;
      }

      setIsVerified(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Gagal mengirim ulang kode');
        return;
      }

      setIsExpired(false);
      setCanResend(false);
      setResendTimer(60);
      setOtp('');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black mb-2">Email Terverifikasi</h1>
            <p className="text-gray-600">Pengalihan ke halaman login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Verifikasi Email</h1>
            <p className="text-gray-600">
              Kami telah mengirim kode ke <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* Timer */}
          {!isExpired && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CountdownTimer
                expiryTime={expiryTime}
                onExpire={() => setIsExpired(true)}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <AuthError 
                message={error}
                onDismiss={() => setError('')}
              />
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-4">
                Masukkan Kode OTP
              </label>
              <OTPInput value={otp} onChange={setOtp} length={6} />
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={otp.length !== 6 || isLoading || isExpired}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memverifikasi...' : 'Verifikasi Email'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-medium">ATAU</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Resend Button */}
          {isExpired ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-600">
                Kode verifikasi telah kadaluarsa
              </p>
              <Button
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  canResend
                    ? 'bg-black hover:bg-gray-900 text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {canResend
                  ? 'Kirim Ulang Kode'
                  : `Kirim Ulang dalam ${resendTimer}s`}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Tidak menerima kode?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 font-semibold underline disabled:opacity-50"
                >
                  Kirim Ulang
                </button>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-600">
              Email salah?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/sign-up')}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Kembali ke daftar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
