import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const ConfirmationModal = ({ onClose, onConfirm, message }) => {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div className="bg-gray-800 text-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold">Confirm Action</h2>
        <p className="mt-2">{message}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2 text-black">Cancel</Button>
          <Button onClick={onConfirm} className="bg-red-600 text-white">Confirm</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmationModal;
