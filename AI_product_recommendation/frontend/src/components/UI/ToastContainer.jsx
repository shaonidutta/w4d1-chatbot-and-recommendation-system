/**
 * Toast Container Component
 * Manages multiple toast notifications
 */
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const ToastContainer = ({ toasts, onRemoveToast, position = 'top-right' }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <Toast
              {...toast}
              position={position}
              onClose={onRemoveToast}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
