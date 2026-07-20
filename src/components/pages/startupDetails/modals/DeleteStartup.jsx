import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
export default function DeleteStartupModal({ isOpen, onClose, onConfirm, startupName }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-red-400">Delete Startup</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete "{startupName}"? This action cannot be undone and will permanently remove all associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-black">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Delete Startup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}