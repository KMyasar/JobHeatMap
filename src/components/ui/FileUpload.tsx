import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
  selectedFile?: File | null;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = ['.pdf', '.docx'],
  maxSize = 5 * 1024 * 1024, // 5MB default
  selectedFile,
  loading = false,
  error,
  className = ''
}) => {
  const [dragError, setDragError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setDragError(`File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setDragError(`Invalid file type. Please upload ${acceptedFileTypes.join(' or ')} files only`);
      } else {
        setDragError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, maxSize, acceptedFileTypes]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize,
    disabled: loading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = error || dragError;

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive && !isDragReject
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105'
              : isDragReject || displayError
              ? 'border-error-500 bg-error-50 dark:bg-error-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              isDragActive && !isDragReject
                ? 'text-primary-500'
                : displayError
                ? 'text-error-500'
                : 'text-gray-400'
            }`} />
          </motion.div>

          <div className="space-y-2">
            <p className={`text-lg font-medium ${
              displayError ? 'text-error-700 dark:text-error-400' : 'text-gray-900 dark:text-white'
            }`}>
              {isDragActive
                ? isDragReject
                  ? 'Invalid file type'
                  : 'Drop your resume here'
                : loading
                ? 'Processing...'
                : 'Upload your resume'
              }
            </p>
            
            <p className={`text-sm ${
              displayError ? 'text-error-600 dark:text-error-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {displayError || 'Drag and drop or click to select'}
            </p>
            
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports PDF and DOCX files up to {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="w-4 h-4 text-success-500 mr-1" />
                  <span className="text-xs text-success-600 dark:text-success-400">
                    File uploaded successfully
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              disabled={loading}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-error-600 dark:text-error-400 flex-shrink-0" />
          <p className="text-sm text-error-700 dark:text-error-400">{displayError}</p>
        </motion.div>
      )}
    </div>
  );
};