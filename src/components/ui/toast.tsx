import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from './button';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, title, description, variant = 'default', onDismiss }) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'destructive':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'destructive':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${getBackgroundColor()} border rounded-lg shadow-lg p-4 max-w-sm w-full`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-6 w-6 p-0"
          onClick={() => onDismiss(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export interface ToasterProps {
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
  }>;
  onDismiss: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}; 