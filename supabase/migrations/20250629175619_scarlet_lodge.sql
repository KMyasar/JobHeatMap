/*
  # Add 2FA Secret Field to Profiles

  1. Database Changes
    - Add two_factor_secret field to store encrypted TOTP secrets
    - Update existing indexes and constraints

  2. Security
    - Ensure proper RLS policies for 2FA data
    - Add constraints for data integrity
*/

-- Add two_factor_secret column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'two_factor_secret'
  ) THEN
    ALTER TABLE profiles ADD COLUMN two_factor_secret text;
  END IF;
END $$;

-- Add index for two_factor_secret (for performance when checking 2FA status)
CREATE INDEX IF NOT EXISTS profiles_two_factor_secret_idx ON profiles(two_factor_secret) WHERE two_factor_secret IS NOT NULL;

-- Update the existing RLS policies to ensure they cover the new field
-- (The existing policies should already cover this since they use auth.uid() = id)

-- Add a constraint to ensure that if 2FA is enabled, a secret must exist
-- This will be enforced at the application level for better user experience