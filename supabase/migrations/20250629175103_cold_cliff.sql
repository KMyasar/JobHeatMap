/*
  # Add Security and Mobile Fields to Profiles

  1. Database Changes
    - Add `mobile_number` field to profiles table
    - Add `two_factor_enabled` field to profiles table
    - Add indexes for new fields

  2. Security
    - Maintain existing RLS policies
    - Ensure new fields are included in user policies
*/

-- Add mobile_number and two_factor_enabled fields to profiles table
DO $$
BEGIN
  -- Add mobile_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'mobile_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN mobile_number text;
  END IF;

  -- Add two_factor_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS profiles_mobile_number_idx ON profiles(mobile_number);
CREATE INDEX IF NOT EXISTS profiles_two_factor_enabled_idx ON profiles(two_factor_enabled);