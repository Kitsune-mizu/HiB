# Authentication Flow Documentation

## Overview
Sistem autentikasi Hikaru Bouken menggunakan Supabase Auth dengan email verification melalui OTP 6-digit yang berlaku selama 5 menit.

## Auth Flow

### 1. Sign Up Flow
```
User → Sign Up Page (fill email, password, name) 
  ↓
Supabase creates auth user
  ↓
Send OTP to email via API
  ↓
Redirect to Verify Email Page
```

**File**: `/app/auth/sign-up/page.tsx`
- Validasi password (min 6 karakter)
- Panggil `/api/auth/send-verification` untuk generate dan kirim OTP
- Redirect ke `/auth/verify-email?email=user@example.com`

### 2. Email Verification Flow
```
Verify Email Page (OTP input, countdown timer)
  ↓
User enters 6-digit OTP
  ↓
POST /api/auth/verify-code
  ↓
Verify OTP (max 3 attempts, 5 menit expiry)
  ↓
Mark user as verified
  ↓
Redirect to Login
```

**File**: `/app/auth/verify-email/page.tsx`
- Input OTP dengan 6 digit
- Countdown timer 5 menit
- Tombol "Kirim Ulang" dengan cooldown 60 detik
- Max 3 percobaan salah
- Auto redirect ke login setelah sukses

### 3. Login Flow
```
Login Page (email, password)
  ↓
POST supabase.auth.signInWithPassword
  ↓
Session created
  ↓
Redirect to account page
```

**File**: `/app/auth/login/page.tsx`
- Simple email/password login
- Middleware handles session persistence
- SessionProvider keeps session synced

### 4. Session Management
```
SessionProvider (client component)
  ↓
Monitor auth state changes
  ↓
Update components in real-time
  ↓
Middleware refreshes session on each request
```

**Files**:
- `/components/auth/session-provider.tsx` - Client-side session listener
- `/lib/supabase/middleware.ts` - Server-side session refresh & route protection

## API Routes

### POST /api/auth/send-verification
Generates and stores OTP for new sign-up.

**Request**:
```json
{ "email": "user@example.com" }
```

**Response** (development mode):
```json
{
  "message": "Kode verifikasi telah dikirim ke email Anda",
  "success": true,
  "code": "123456"  // Only in development
}
```

### POST /api/auth/verify-code
Verifies OTP code.

**Request**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response**:
```json
{
  "message": "Email berhasil diverifikasi",
  "success": true
}
```

**Error Handling**:
- Code expired → "Kode verifikasi telah kadaluarsa"
- Code invalid → "Kode OTP tidak valid. Tersisa X percobaan."
- Too many attempts → "Terlalu banyak percobaan yang gagal."

### POST /api/auth/resend-code
Resends OTP code with rate limiting.

**Request**:
```json
{ "email": "user@example.com" }
```

**Rate Limit**: 5 attempts per minute

## Protected Routes

Middleware (`/lib/supabase/middleware.ts`) automatically:
- ✅ Redirects unauthenticated users from `/account`, `/cart`, `/checkout` to login
- ✅ Redirects authenticated users away from auth pages
- ✅ Validates admin role for `/admin/*` routes
- ✅ Refreshes session on every request

## Styling Consistency

All auth pages use Hikaru Bouken brand colors:
- **Primary Red**: `#E10600`
- **Black**: Background for dark sections
- **White**: Form backgrounds
- **Gray**: Neutral text and borders

### Components Used
- `AuthError` - Red error message with icon
- `AuthSuccess` - Green success message
- `SessionProvider` - Wraps entire app for session management

## Development Notes

### OTP Storage
Currently uses in-memory Map (suitable for single server).

**For Production**, replace with:
- Redis for distributed systems
- Database table `email_verifications` with:
  - `email` (string, unique)
  - `code` (string)
  - `expires_at` (timestamp)
  - `attempts` (int)
  - `created_at` (timestamp)

### Email Service
Currently logs OTP to console in development.

**For Production**, integrate email service:
- SendGrid
- Resend.com
- Mailgun
- AWS SES

### Rate Limiting
Currently uses in-memory Map.

**For Production**, use:
- Upstash Redis
- Redis
- Database

## Hooks & Utilities

### useAuth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isLoading, isError } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Hello, {user.email}</div>;
}
```

## Testing Flow

1. **Sign Up**:
   - Go to `/auth/sign-up`
   - Fill in email, password (6+ chars), name
   - Should redirect to `/auth/verify-email?email=...`

2. **Verify Email**:
   - Check browser console for OTP (development mode)
   - Or check API response from `/api/auth/resend-code`
   - Enter 6-digit code
   - Should show success and redirect to login

3. **Login**:
   - Go to `/auth/login`
   - Enter email and password
   - Should redirect to `/account`

4. **Session Persistence**:
   - Login → go to `/account` (should work)
   - Refresh page → should still be logged in
   - Close browser and reopen → should stay logged in

5. **Protected Routes**:
   - Visit `/account` while logged out → redirect to login
   - Visit `/auth/login` while logged in → redirect to account
