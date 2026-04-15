# Testing Authentication System

## Quick Start

### 1. Sign Up Testing

**Steps**:
1. Navigate to `http://localhost:3000/auth/sign-up`
2. Fill in form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Buat Akun"
4. Should redirect to `/auth/verify-email?email=test@example.com`

**What Happens**:
- Supabase creates new auth user
- API generates 6-digit OTP and stores in memory
- OTP is logged to browser console (development mode)
- Check browser DevTools → Console for OTP code

### 2. Email Verification Testing

**Steps**:
1. After sign-up, you're on verify-email page
2. Open browser DevTools (F12) → Console tab
3. Look for log: `[v0] OTP for test@example.com: XXXXXX`
4. Copy the 6-digit code
5. Paste into OTP input fields (auto-advances to next)
6. Click "Verifikasi Email"
7. Should show success message and redirect to login

**Timer Features**:
- ⏱️ Countdown shows remaining time (5 minutes = 300 seconds)
- 🔄 "Kirim Ulang" button appears after 5 minutes
- 🔄 With cooldown of 60 seconds between resends

**Resend Testing**:
1. Let OTP expire (5 minutes) or click "Kirim Ulang" after initial send
2. Check console for new OTP code
3. Try to verify with old code → should fail
4. Try to verify with new code → should succeed

### 3. Login Testing

**Steps**:
1. After verification, you're redirected to `/auth/login`
2. Or navigate to `http://localhost:3000/auth/login`
3. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Masuk"
5. Should redirect to `/account`

**What to Check**:
- ✅ Session persists after page refresh
- ✅ Middleware redirects unauthenticated to login
- ✅ Authenticated users can't access auth pages

### 4. Profile Page Testing

**Steps**:
1. After login, you're on `/account` (Profile page)
2. Update profile information:
   - Full Name: "Test Updated"
   - Phone: "+62812345678"
   - Address: "123 Main St"
3. Click "Simpan Perubahan"
4. Should show success toast
5. Page refreshes and shows updated info

**Session Persistence**:
1. While logged in, open new tab with same domain
2. Navigate to `/account` → should still be logged in
3. Refresh page → should still show profile
4. Close browser and reopen → should still be logged in (24-48 hours)

### 5. Error Handling Testing

**Invalid OTP**:
1. Enter wrong 6-digit code → Error: "Kode OTP tidak valid. Tersisa 3 percobaan."
2. Try 3 times with wrong codes → Locked out with "Terlalu banyak percobaan"
3. Must request new OTP

**Expired OTP**:
1. Wait 5 minutes without entering code
2. Try to submit OTP → Error: "Kode verifikasi telah kadaluarsa"
3. Must click "Kirim Ulang" to get new code

**Rate Limiting**:
1. Try clicking "Kirim Ulang" 6+ times in 1 minute
2. Should get error: "Terlalu banyak percobaan. Silakan coba lagi dalam 1 menit."

**Invalid Credentials**:
1. Go to `/auth/login`
2. Enter wrong password → Error: "Invalid login credentials"
3. Enter non-existent email → Error: "Invalid login credentials"

### 6. Protected Routes Testing

**Unauthenticated Access**:
1. Open incognito/private window
2. Try to visit `/account` → Redirects to `/auth/login`
3. Try to visit `/cart` → Redirects to `/auth/login`

**Authenticated Redirect**:
1. While logged in, visit `/auth/sign-up` → Redirects to `/account`
2. While logged in, visit `/auth/login` → Redirects to `/account`

## Browser DevTools Debugging

### Console Logs
Look for these logs during auth flow:

```
[v0] OTP for test@example.com: 123456
[v0] Session initialization error: (if error occurs)
[v0] Verification error: (if verification fails)
```

### Application → Cookies
Look for Supabase session cookies:

```
sb-{project-id}-auth-token (encrypted session)
sb-{project-id}-auth-token-code-verifier
```

### Network Tab
Watch API calls:

**POST /api/auth/send-verification**
- Request: `{ "email": "test@example.com" }`
- Response: `{ "success": true, "code": "123456" }`

**POST /api/auth/verify-code**
- Request: `{ "email": "test@example.com", "code": "123456" }`
- Response: `{ "success": true, "message": "Email berhasil diverifikasi" }`

**POST /api/auth/resend-code**
- Request: `{ "email": "test@example.com" }`
- Response: `{ "success": true, "code": "789012" }`

## Known Limitations (Development)

⚠️ **Current Limitations**:
- OTP stored in-memory (resets on server restart)
- Email not actually sent (only logged to console)
- Rate limiting uses in-memory Map

✅ **For Production**:
- Replace OTP store with Redis or database
- Integrate email service (SendGrid, Resend.com, etc.)
- Use Redis for rate limiting
- Add email verification templates
- Add resend email functionality
- Add password reset flow
- Add 2FA support

## Troubleshooting

### "Session not persisting"
- Check middleware is running: `/lib/supabase/middleware.ts`
- Clear browser cookies and try again
- Check environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Can't find OTP code"
- Check browser console (F12 → Console tab)
- OTP is only logged in development mode
- Try resending code
- Check if 5 minutes have passed (code expires)

### "Verification always fails"
- Make sure OTP is exactly 6 digits
- Copy-paste from console to avoid typos
- Check if code is expired (5 minute limit)
- Check if you've exceeded 3 attempts

### "Can't login after verification"
- Make sure you verified the email
- Check if auth user was created in Supabase
- Try logging out and back in
- Check browser cookies are enabled

## API Response Codes

```
200 OK - Success
400 Bad Request - Invalid input or expired code
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
```

## Environment Variables

Make sure these are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Performance Notes

- OTP verification is instant (< 100ms)
- Session refresh on every request
- SessionProvider initializes on app load
- Middleware runs on every route change

For profiling, check Network and Performance tabs in DevTools.
