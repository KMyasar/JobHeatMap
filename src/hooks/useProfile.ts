import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  skills: string[];
  preferred_locations: string[];
  resume_url: string | null;
  certifications: string[];
  achievements: string | null;
  mobile_number: string | null;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setProfile(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      // Use upsert to handle both insert and update cases
      const profileData = {
        id: user.id,
        email: user.email!,
        ...updates,
        // Don't manually set updated_at - let the trigger handle it
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setProfile(data);
      setError(null);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in updateProfile:', err);
      setError(err.message);
      return { data: null, error: err.message };
    }
  };

  const createProfile = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      setProfile(data);
      setError(null);
      return { data, error: null };
    } catch (err: any) {
      console.error('Error in createProfile:', err);
      setError(err.message);
      return { data: null, error: err.message };
    }
  };

  // Helper function to check if profile is complete
  const isProfileComplete = () => {
    return profile && 
           profile.full_name && 
           profile.full_name.trim() !== '' && 
           profile.skills && 
           profile.skills.length > 0;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refetch: fetchProfile,
    isProfileComplete: isProfileComplete(),
  };
};