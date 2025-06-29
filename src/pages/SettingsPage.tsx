import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Lock, 
  Shield, 
  Phone, 
  Save, 
  Upload, 
  X, 
  Plus, 
  MapPin, 
  Award, 
  Target,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { TwoFactorSetup } from '../components/TwoFactorSetup';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import * as OTPAuth from 'otpauth';

interface ProfileFormData {
  fullName: string;
  mobileNumber: string;
  achievements: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

const popularSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL',
  'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis',
  'Project Management', 'Agile', 'Git', 'Java', 'C++', 'MongoDB'
];

const popularLocations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
  'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Denver, CO',
  'Remote', 'London, UK', 'Toronto, CA', 'Berlin, Germany'
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  
  // Form states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customCertification, setCustomCertification] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  
  // Loading states
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Form hooks
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      achievements: '',
    }
  });

  const passwordForm = useForm<PasswordFormData>();

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      profileForm.setValue('fullName', profile.full_name || '');
      profileForm.setValue('mobileNumber', profile.mobile_number || '');
      profileForm.setValue('achievements', profile.achievements || '');
      setSelectedSkills(profile.skills || []);
      setSelectedLocations(profile.preferred_locations || []);
      setCertifications(profile.certifications || []);
      setTwoFactorEnabled(profile.two_factor_enabled || false);
      setTwoFactorSecret(profile.two_factor_secret || '');
    }
  }, [profile, profileForm]);

  // Toast management
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Skill management
  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      removeSkill(skill);
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Location management
  const addCustomLocation = () => {
    if (customLocation.trim() && !selectedLocations.includes(customLocation.trim())) {
      setSelectedLocations([...selectedLocations, customLocation.trim()]);
      setCustomLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location));
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      removeLocation(location);
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  // Certification management
  const addCertification = () => {
    if (customCertification.trim() && !certifications.includes(customCertification.trim())) {
      setCertifications([...certifications, customCertification.trim()]);
      setCustomCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  // Profile update handler
  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setProfileSaving(true);
    try {
      const profileData = {
        email: user.email!,
        full_name: data.fullName,
        skills: selectedSkills,
        preferred_locations: selectedLocations,
        certifications: certifications,
        achievements: data.achievements || null,
        mobile_number: data.mobileNumber || null,
      };

      const { error } = await updateProfile(profileData);

      if (error) {
        showToast('error', error);
        return;
      }

      showToast('success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast('error', error.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Password change handler
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordChanging(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        showToast('error', error.message);
        return;
      }

      showToast('success', 'Password updated successfully!');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      showToast('error', 'Failed to update password');
    } finally {
      setPasswordChanging(false);
    }
  };

  // 2FA handlers
  const handle2FASetupSuccess = () => {
    setTwoFactorEnabled(true);
    showToast('success', 'Two-factor authentication enabled successfully!');
  };

  const disable2FA = async () => {
    setTwoFactorLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null
        })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      setTwoFactorEnabled(false);
      setTwoFactorSecret('');
      showToast('success', 'Two-factor authentication disabled successfully!');
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      showToast('error', error.message || 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <Layout title="Settings">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              toast.type === 'success' 
                ? 'bg-success-50 border border-success-200 text-success-800' 
                : 'bg-error-50 border border-error-200 text-error-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 2FA Setup Modal */}
        <TwoFactorSetup
          isOpen={show2FASetup}
          onClose={() => setShow2FASetup(false)}
          onSuccess={handle2FASetupSuccess}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your profile information and security preferences
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'security'
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              {/* Basic Information */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    {...profileForm.register('fullName', { required: 'Full name is required' })}
                    error={profileForm.formState.errors.fullName?.message}
                    placeholder="Enter your full name"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <Input
                    label="Mobile Number"
                    {...profileForm.register('mobileNumber')}
                    placeholder="Enter your mobile number"
                    type="tel"
                  />
                </div>
              </Card>

              {/* Skills */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Skills
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  {popularSkills.map((skill) => (
                    <motion.button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary-100 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {skill}
                    </motion.button>
                  ))}
                </div>

                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Add custom skill"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  />
                  <Button type="button" onClick={addCustomSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-primary-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Preferred Locations */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Preferred Locations
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                  {popularLocations.map((location) => (
                    <motion.button
                      key={location}
                      type="button"
                      onClick={() => toggleLocation(location)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        selectedLocations.includes(location)
                          ? 'bg-accent-100 border-accent-500 text-accent-700 dark:bg-accent-900 dark:text-accent-300'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-accent-300'
                      }`}
                    >
                      {location}
                    </motion.button>
                  ))}
                </div>

                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="Add custom location"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLocation())}
                  />
                  <Button type="button" onClick={addCustomLocation} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((location) => (
                      <span
                        key={location}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200"
                      >
                        {location}
                        <button
                          type="button"
                          onClick={() => removeLocation(location)}
                          className="ml-2 hover:text-accent-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Certifications */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Certifications
                  </h3>
                </div>

                <div className="flex space-x-2 mb-4">
                  <Input
                    placeholder="e.g., AWS Certified Solutions Architect"
                    value={customCertification}
                    onChange={(e) => setCustomCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {certifications.length > 0 && (
                  <div className="space-y-2">
                    {certifications.map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">{cert}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(cert)}
                          className="text-error-500 hover:text-error-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Achievements */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Achievements & Notable Projects
                  </h3>
                </div>

                <Textarea
                  {...profileForm.register('achievements')}
                  placeholder="Describe your key achievements, notable projects, or career highlights..."
                  className="min-h-[120px]"
                />
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={profileSaving}
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Change Password */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...passwordForm.register('currentPassword', {
                      required: 'Current password is required'
                    })}
                    error={passwordForm.formState.errors.currentPassword?.message}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    {...passwordForm.register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    error={passwordForm.formState.errors.newPassword?.message}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...passwordForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === passwordForm.watch('newPassword') || 'Passwords do not match'
                    })}
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  loading={passwordChanging}
                  variant="secondary"
                >
                  Update Password
                </Button>
              </form>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      twoFactorEnabled 
                        ? 'bg-success-100 dark:bg-success-900' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Smartphone className={`w-6 h-6 ${
                        twoFactorEnabled 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Authenticator App
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Use an authenticator app to generate secure codes for signing in. 
                      Compatible with Google Authenticator, Authy, and other TOTP apps.
                    </p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      twoFactorEnabled
                        ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {twoFactorEnabled ? (
                      <Button
                        onClick={disable2FA}
                        loading={twoFactorLoading}
                        variant="outline"
                        size="sm"
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShow2FASetup(true)}
                        size="sm"
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                </div>

                {twoFactorEnabled && (
                  <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
                      <p className="text-sm text-success-700 dark:text-success-300">
                        Two-factor authentication is active. You'll need to enter a code from your authenticator app when signing in.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Information */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Account Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Email</span>
                  <span className="text-gray-900 dark:text-white font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Account Created</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700 dark:text-gray-300">Last Sign In</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};