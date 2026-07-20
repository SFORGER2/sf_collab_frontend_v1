import { useState } from 'react';
import { Loader2, UserPlus, Clock, UserCheck, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useConnectionStatus, ConnectionStatus } from '@/components/hooks/useConnectionStatus';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AddFriend({ user }) {
  const { status, isLoading, actions } = useConnectionStatus(user?.id);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isProcessing = isLoading || localLoading;

  // Don't render for own profile
  if (status === ConnectionStatus.SELF) {
    return null;
  }

  const handleSendRequest = async () => {
    setLocalLoading(true);
    const result = await actions.sendRequest();

    if (result.success) {
      toast.success('Friend request sent!');
      setIsOpen(false);
    } else {
      toast.error(result.error || 'Failed to send request');
    }
    setLocalLoading(false);
  };

  const handleCancelRequest = async () => {
    setLocalLoading(true);
    const result = await actions.cancelRequest();

    if (result.success) {
      toast.success('Request cancelled');
      setShowCancelConfirm(false);
    } else {
      toast.error(result.error || 'Failed to cancel request');
    }
    setLocalLoading(false);
  };

  const handleAcceptRequest = async () => {
    setLocalLoading(true);
    const result = await actions.acceptRequest();

    if (result.success) {
      toast.success('Friend request accepted!');
      setIsOpen(false);
    } else {
      toast.error(result.error || 'Failed to accept request');
    }
    setLocalLoading(false);
  };

  const handleDeclineRequest = async () => {
    setLocalLoading(true);
    const result = await actions.declineRequest();

    if (result.success) {
      toast.info('Request declined');
    } else {
      toast.error(result.error || 'Failed to decline request');
    }
    setLocalLoading(false);
  };

  const handleRemoveConnection = async () => {
    setLocalLoading(true);
    const result = await actions.removeConnection(user?.id);

    if (result.success) {
      toast.success('Friend removed');
      setShowRemoveConfirm(false);
      setIsOpen(false);
    } else {
      toast.error(result.error || 'Failed to remove friend');
    }
    setLocalLoading(false);
  };

  // NONE - Add Friend Button
  if (status === ConnectionStatus.NONE) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-md bg-gray-900 border border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-bold">
                Add {user?.firstName} {user?.lastName} as Friend?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <p className="text-gray-300 text-sm">
                Send a friend request to {user?.firstName}. They'll need to accept your request to become friends.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // REQUEST_SENT - Cancel Request
  if (status === ConnectionStatus.REQUEST_SENT && !showCancelConfirm) {
    return (
      <Button
        onClick={() => setShowCancelConfirm(true)}
        disabled={isProcessing}
        variant="outline"
        size="sm"
        className="border-gray-600 text-black hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Clock className="w-4 h-4 mr-2" />
        )}
        Request Sent
      </Button>
    );
  }
  
  // CANCEL REQUEST SENT
  if (showCancelConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Cancel friend request?</span>
        <Button
          onClick={handleCancelRequest}
          disabled={isProcessing}
          size="sm"
          variant="outline"
          className="h-8 px-2 border-gray-600 text-black hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
        >
          {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
        </Button>
        <Button
          onClick={() => setShowCancelConfirm(false)}
          size="sm"
          variant="outline"
          className="h-8 px-2 border-gray-600 text-black"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }
  // REQUEST_RECEIVED - Accept/Decline
  if (status === ConnectionStatus.REQUEST_RECEIVED) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleAcceptRequest}
          disabled={isProcessing}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Accept
        </Button>

        <Button
          onClick={handleDeclineRequest}
          disabled={isProcessing}
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // CONNECTED - Remove Friend
  if (status === ConnectionStatus.CONNECTED) {
    if (showRemoveConfirm) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Remove friend?</span>
          <Button
            onClick={handleRemoveConnection}
            disabled={isProcessing}
            size="sm"
            variant="destructive"
            className="h-8 px-2"
          >
            {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => setShowRemoveConfirm(false)}
            size="sm"
            variant="outline"
            className="h-8 px-2 border-gray-600 text-black"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={() => setShowRemoveConfirm(true)}
        size="sm"
        variant="outline"
        className="border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-white"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        Friends
      </Button>
    );
  }

  // LOADING
  if (status === ConnectionStatus.LOADING) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return null;
}