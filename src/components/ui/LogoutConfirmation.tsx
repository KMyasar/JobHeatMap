import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface LogoutConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  loading = false
}) => {
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
              <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Confirm Logout
              </h3>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onConfirm}
              loading={loading}
              variant="danger"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Yes, Logout</span>
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};