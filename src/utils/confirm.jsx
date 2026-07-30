import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const DeleteConfirmationModal = ({ 
  onClose, 
  isOpen,
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure? This is irreversible',
  type = 'hard' // 'soft' or 'hard'
}) => {
  const [inputValue, setInputValue] = useState('');
  const requiresInput = type === 'hard';
  const isConfirmDisabled = requiresInput && inputValue.toLowerCase() !== 'delete';
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-1000"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 text-white p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4"
      >
        <h2 className="text-xl font-bold text-red-500">{title}</h2>
        <p className="mt-3 text-gray-300">{message}</p>

        {requiresInput && (
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-2">Type "delete" to confirm:</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type 'delete'"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-red-600"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="text-star border-white/15 hover:bg-white/10 hover:text-star transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (!isConfirmDisabled) {
                setInputValue('');
                onConfirm();
                onClose()
              }
            }}
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteConfirmationModal;