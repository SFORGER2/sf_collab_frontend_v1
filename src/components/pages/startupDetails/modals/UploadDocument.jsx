import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function UploadDocumentModal({ isOpen, onClose, onSubmit, formData, onFormChange }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFormChange({ ...formData, document: file });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Upload Document
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-sm text-gray-300 mb-2 block font-medium">Document</label>
            <div className="relative">
              <Input
                type="file"
                onChange={handleFileChange}
                className="flex items-center bg-gray-700 h-16 border-gray-600 text-white file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-small file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
              {fileName && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-700/50 rounded border border-gray-600">
                  <File className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300 truncate">{fileName}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="text-sm text-gray-300 mb-2 block font-medium">Document Type</label>
            <Select value={formData.document_type} onValueChange={(value) => onFormChange({ ...formData, document_type: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:border-gray-500 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="general" className="text-white focus:bg-gray-700">General</SelectItem>
                <SelectItem value="business_plan" className="text-white focus:bg-gray-700">Business Plan</SelectItem>
                <SelectItem value="pitch_deck" className="text-white focus:bg-gray-700">Pitch Deck</SelectItem>
                <SelectItem value="financial" className="text-white focus:bg-gray-700">Financial</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-sm text-gray-300 mb-2 block font-medium">Visibility</label>
            <Select value={formData.visible_by || 'private'} onValueChange={(value) => onFormChange({ ...formData, visible_by: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white hover:border-gray-500 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 ">
                <SelectItem value="private" className="text-white focus:bg-gray-700">Just Me</SelectItem>
                <SelectItem value="team" className="text-white focus:bg-gray-700">Team Only</SelectItem>
                <SelectItem value="public" className="text-white focus:bg-gray-700">Public</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <div className="flex gap-3 pt-4">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="w-full border-gray-600 text-black hover:border-gray-500 hover:bg-gray-700/50"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="submit" 
                className={`w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-blue-500/50 transition-all ${!formData.document ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={!formData.document}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}