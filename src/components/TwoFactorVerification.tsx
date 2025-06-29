import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import * as OTPAuth from 'otpauth';

interface TwoFactorVerificationProps {
  secret: string;
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  secret,
  onVerify,
  onCancel,
  loading = false
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const isValid = await onVerify(code);
      if (!isValid) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Two-Factor Authentication
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app
            </p>
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

          <div className="space-y-6">
            <Input
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="000000"
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              autoFocus
            />

            <div className="flex space-x-3">
              <Button
                onClick={handleVerify}
                loading={verifying || loading}
                disabled={code.length !== 6}
                className="flex-1"
              >
                Verify
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1"
                disabled={verifying || loading}
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Can't access your authenticator app?{' '}
              <button
                onClick={onCancel}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Contact support
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};