/**
 * Loading Spinner Component with Girly Design
 */
import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', showText = true }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Heart Spinner */}
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className={`${sizeClasses[size]} relative`}>
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 border-4 border-primary-200 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Inner Ring */}
          <motion.div
            className="absolute inset-1 border-2 border-accent-300 rounded-full"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Center Heart */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <HeartIcon className={`${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : size === 'large' ? 'w-6 h-6' : 'w-8 h-8'} text-primary-500`} />
          </motion.div>
        </div>
      </motion.div>

      {/* Loading Text */}
      {showText && (
        <motion.p
          className={`${textSizeClasses[size]} text-gray-600 font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}

      {/* Floating Dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-primary-400 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Alternative Shimmer Loading Component
export const ShimmerLoader = ({ className = '' }) => {
  return (
    <div className={`shimmer bg-gray-200 rounded-lg ${className}`}>
      <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-full w-full rounded-lg" />
    </div>
  );
};

// Card Skeleton Loader
export const CardSkeleton = () => {
  return (
    <div className="product-card p-4 space-y-4">
      <ShimmerLoader className="h-48 w-full" />
      <div className="space-y-2">
        <ShimmerLoader className="h-4 w-3/4" />
        <ShimmerLoader className="h-4 w-1/2" />
        <ShimmerLoader className="h-6 w-1/4" />
      </div>
    </div>
  );
};

// Button Loading State
export const ButtonSpinner = ({ size = 'small' }) => {
  const spinnerSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <motion.div
      className={`${spinnerSize} border-2 border-white border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

export default LoadingSpinner;
