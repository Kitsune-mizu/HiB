-- Create email_verifications table for OTP-based verification
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 5,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified_at timestamp with time zone,
  verified boolean DEFAULT false NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON public.email_verifications(code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_verified ON public.email_verifications(verified);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own verifications
CREATE POLICY "Users can view their own email verifications"
  ON public.email_verifications
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own email verifications"
  ON public.email_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own email verifications"
  ON public.email_verifications
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
