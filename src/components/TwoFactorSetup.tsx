import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Shield, Copy, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);

  // Generate secret and QR code when component mounts
  useEffect(() => {
    if (isOpen && user) {
      generateSecret();
    }
  }, [isOpen, user]);

  const generateSecret = async () => {
    try {
      // Generate a random secret
      const newSecret = new OTPAuth.Secret({ size: 20 }).base32;
      setSecret(newSecret);

      // Create TOTP URI
      const totp = new OTPAuth.TOTP({
        issuer: 'Job Prep Heatmap',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: newSecret,
      });

      const uri = totp.toString();

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(uri);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating secret:', error);
      setError('Failed to generate 2FA setup. Please try again.');
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy secret:', error);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'Job Prep Heatmap',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      const isValid = totp.validate({ token: verificationCode, window: 1 });

      if (isValid === null) {
        setError('Invalid verification code. Please try again.');
        return;
      }

      // Save the secret to the database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
          two_factor_secret: secret
        })
        .eq('id', user?.id);

      if (dbError) {
        throw dbError;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error verifying 2FA:', error);
      setError(error.message || 'Failed to enable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    setError('');

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

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      setError(error.message || 'Failed to disable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
              <p className="text-sm text-error-700 dark:text-error-400">{error}</p>
            </motion.div>
          )}

          {step === 'setup' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                {qrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      className="w-48 h-48 border border-gray-200 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or enter this secret key manually:
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm bg-gray-50 dark:bg-gray-800"
                  />
                  <Button
                    type="button"
                    onClick={copySecret}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {secretCopied ? (
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Recommended Apps
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Google Authenticator</li>
                      <li>• Authy</li>
                      <li>• Microsoft Authenticator</li>
                      <li>• 1Password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setStep('verify')}
                  className="flex-1"
                  disabled={!secret}
                >
                  Continue to Verification
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <QrCode className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Verify Your Setup
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app to complete setup
                </p>
              </div>

              <div>
                <Input
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={verifyCode}
                  loading={loading}
                  disabled={verificationCode.length !== 6}
                  className="flex-1"
                >
                  Enable 2FA
                </Button>
                <Button
                  onClick={() => setStep('setup')}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};