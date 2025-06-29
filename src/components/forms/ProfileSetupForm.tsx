import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Upload, X, Plus, MapPin, Award, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

interface ProfileFormData {
  fullName: string;
  skills: string[];
  preferredLocations: string[];
  certifications: string[];
  achievements: string;
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

interface ProfileSetupFormProps {
  onComplete: () => void;
}

export const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile?.skills || []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(profile?.preferred_locations || []);
  const [certifications, setCertifications] = useState<string[]>(profile?.certifications || []);
  const [customSkill, setCustomSkill] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customCertification, setCustomCertification] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profile?.full_name || '',
      achievements: profile?.achievements || '',
    }
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '');
      setValue('achievements', profile.achievements || '');
      setSelectedSkills(profile.skills || []);
      setSelectedLocations(profile.preferred_locations || []);
      setCertifications(profile.certifications || []);
    }
  }, [profile, setValue]);

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const addCustomLocation = () => {
    if (customLocation.trim() && !selectedLocations.includes(customLocation.trim())) {
      setSelectedLocations([...selectedLocations, customLocation.trim()]);
      setCustomLocation('');
    }
  };

  const addCertification = () => {
    if (customCertification.trim() && !certifications.includes(customCertification.trim())) {
      setCertifications([...certifications, customCertification.trim()]);
      setCustomCertification('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location));
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      removeSkill(skill);
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      removeLocation(location);
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const profileData = {
        email: user.email!,
        full_name: data.fullName,
        skills: selectedSkills,
        preferred_locations: selectedLocations,
        certifications: certifications,
        achievements: data.achievements || null,
      };

      const { error } = await updateProfile(profileData);

      if (error) {
        setSubmitError(error);
        return;
      }

      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSubmitError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {profile ? 'Update Your Profile' : 'Complete Your Profile'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Help us personalize your job search experience
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep} of 3
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((currentStep / 3) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {submitError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg"
          >
            <p className="text-sm text-error-700 dark:text-error-400">{submitError}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h3>
              </div>

              <Input
                label="Full Name *"
                {...register('fullName', { required: 'Full name is required' })}
                error={errors.fullName?.message}
                placeholder="Enter your full name"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills & Locations */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Skills Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Skills *
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
              </div>

              {/* Locations Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preferred Locations *
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
              </div>
            </motion.div>
          )}

          {/* Step 3: Additional Information */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Certifications */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Certifications (Optional)
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
              </div>

              {/* Achievements */}
              <div>
                <Textarea
                  label="Achievements & Notable Projects (Optional)"
                  {...register('achievements')}
                  placeholder="Describe your key achievements, notable projects, or career highlights..."
                  className="min-h-[120px]"
                  helperText="This information will help improve job matching accuracy"
                />
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="space-x-4">
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !user?.email) ||
                    (currentStep === 2 && (selectedSkills.length === 0 || selectedLocations.length === 0))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading}
                  disabled={selectedSkills.length === 0 || selectedLocations.length === 0}
                >
                  {profile ? 'Update Profile' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};