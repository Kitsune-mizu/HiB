-- Create OTP codes table for email verification
-- This table stores OTP codes with expiration and attempt tracking

CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL, -- SHA-256 hash of the OTP code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Add email_verified column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create index for email_verified status
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Enable Row Level Security
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON otp_codes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Clean up expired OTP codes (run periodically)
-- DELETE FROM otp_codes WHERE expires_at < NOW();

COMMENT ON TABLE otp_codes IS 'Stores OTP verification codes with expiration and attempt tracking';
COMMENT ON COLUMN otp_codes.code_hash IS 'SHA-256 hash of the 6-digit OTP code for security';
COMMENT ON COLUMN otp_codes.attempts IS 'Number of verification attempts (max 3)';
