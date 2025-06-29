import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  gradient = false 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        ${gradient 
          ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' 
          : 'bg-white/70 dark:bg-gray-800/70'
        }
        backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 
        rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};