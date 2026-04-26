'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiX, FiTrash2 } from 'react-icons/fi';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'delete' | 'complete';
  itemName: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  itemName,
  loading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <FiTrash2 className="h-12 w-12 text-red-500" />;
      case 'complete':
        return <FiCheckCircle className="h-12 w-12 text-green-500" />;
      default:
        return <FiAlertCircle className="h-12 w-12 text-blue-500" />;
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case 'delete':
        return {
          confirm: 'bg-red-600 hover:bg-red-700',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        };
      case 'complete':
        return {
          confirm: 'bg-green-600 hover:bg-green-700',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        };
      default:
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        };
    }
  };

  const getConfirmText = () => {
    switch (type) {
      case 'delete':
        return 'Delete';
      case 'complete':
        return 'Complete';
      default:
        return 'Confirm';
    }
  };

  const buttonColors = getButtonColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition rounded-lg p-1 hover:bg-gray-100"
            >
              <FiX className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${
                type === 'delete' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {getIcon()}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
              {title}
            </h2>

            {/* Message */}
            <p className="text-center text-gray-600 mb-6">
              {message}{' '}
              <span className="font-semibold text-gray-900 break-words">
                "{itemName.length > 50 ? itemName.substring(0, 50) + '...' : itemName}"
              </span>
              ?
            </p>

            {/* Warning for delete */}
            {type === 'delete' && (
              <p className="text-xs text-center text-red-500 mb-4">
                ⚠️ This action cannot be undone
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className={`flex-1 ${buttonColors.cancel} px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 ${buttonColors.confirm} text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  getConfirmText()
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}