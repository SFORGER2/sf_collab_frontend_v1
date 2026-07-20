

import { useState } from 'react';
import { Loader2, UserPlus, Clock, UserCheck, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectionStatus, ConnectionStatus } from '../hooks/useConnectionStatus';
import { toast } from 'react-toastify';

export function ConnectionButton({
  userId,
  size = 'default',
  onStatusChange,
  className = '',
}) {
  const { status, isLoading, actions } = useConnectionStatus(userId);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: { button: 'h-8 px-3 text-xs', icon: 14 },
    default: { button: 'h-10 px-4 text-sm', icon: 16 },
    lg: { button: 'h-12 px-6 text-base', icon: 18 },
  };
  const config = sizeConfig[size];

  /**
   * Handle send request
   */
  const handleSendRequest = async () => {
    setLocalLoading(true);
    const result = await actions.sendRequest();
    
    if (result.success) {
      toast.success('Connection request sent!');
      onStatusChange?.('request_sent');
    } else {
      toast.error(result.error || 'Failed to send request');
    }
    setLocalLoading(false);
  };

  /**
   * Handle cancel request (for sender)
   */
  const handleCancelRequest = async () => {
    setLocalLoading(true);
    const result = await actions.cancelRequest();
    
    if (result.success) {
      toast.success('Request cancelled');
      onStatusChange?.('none');
    } else {
      toast.error(result.error || 'Failed to cancel request');
    }
    setLocalLoading(false);
    setShowCancelConfirm(false);
  };

  /**
   * Handle accept request (for receiver)
   */
  const handleAcceptRequest = async () => {
    setLocalLoading(true);
    const result = await actions.acceptRequest();
    
    if (result.success) {
      toast.success('Connection accepted!');
      onStatusChange?.('connected');
    } else {
      toast.error(result.error || 'Failed to accept request');
    }
    setLocalLoading(false);
  };

  /**
   * Handle decline request (for receiver)
   */
  const handleDeclineRequest = async () => {
    setLocalLoading(true);
    const result = await actions.declineRequest();
    
    if (result.success) {
      toast.info('Request declined');
      onStatusChange?.('none');
    } else {
      toast.error(result.error || 'Failed to decline request');
    }
    setLocalLoading(false);
  };

  /**
   * Handle remove connection
   */
  const handleRemoveConnection = async () => {
  setLocalLoading(true);
  const result = await actions.removeConnection(userId);
    
    if (result.success) {
      toast.success('Connection removed');
      onStatusChange?.('none');
    } else {
      toast.error(result.error || 'Failed to remove connection');
    }
    setLocalLoading(false);
    setShowRemoveConfirm(false);
  };

  const isProcessing = isLoading || localLoading;

  // Don't render for own profile
  if (status === ConnectionStatus.SELF) {
    return null;
  }

  // Loading state
  if (status === ConnectionStatus.LOADING) {
    return (
      <Button disabled variant="outline" className={`${config.button} ${className}`}>
        <Loader2 className="animate-spin" size={config.icon} />
        <span className="ml-2">Loading...</span>
      </Button>
    );
  }

  // ==========================================================================
  // NO CONNECTION → "Connect" button
  // ==========================================================================
  if (status === ConnectionStatus.NONE) {
    return (
      <Button
        onClick={handleSendRequest}
        disabled={isProcessing}
        className={`
          ${config.button}
          bg-gradient-to-r from-blue-600 to-purple-600 
          hover:from-blue-700 hover:to-purple-700 
          text-white
          ${className}
        `}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={config.icon} />
        ) : (
          <UserPlus size={config.icon} />
        )}
        <span className="ml-2">Connect</span>
      </Button>
    );
  }

  // ==========================================================================
  // REQUEST SENT → "Request Sent" with cancel option
  // ==========================================================================
  if (status === ConnectionStatus.REQUEST_SENT) {
    // Show confirmation
    if (showCancelConfirm) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <span className="text-xs text-gray-400">Cancel request?</span>
          <Button
            onClick={handleCancelRequest}
            disabled={isProcessing}
            size="sm"
            variant="destructive"
            className="h-8 px-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
          </Button>
          <Button
            onClick={() => setShowCancelConfirm(false)}
            size="sm"
            variant="outline"
            className="h-8 px-2 border-gray-600"
          >
            <X size={14} />
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={() => setShowCancelConfirm(true)}
        disabled={isProcessing}
        variant="outline"
        className={`
          ${config.button}
          border-gray-600 text-black
          hover:bg-gray-700 hover:text-white hover:border-red-500
          ${className}
        `}
        title="Click to cancel request"
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={config.icon} />
        ) : (
          <Clock size={config.icon} />
        )}
        <span className="ml-2">Request Sent</span>
      </Button>
    );
  }

  // ==========================================================================
  // REQUEST RECEIVED → "Accept" / "Decline" buttons
  // ==========================================================================
  if (status === ConnectionStatus.REQUEST_RECEIVED) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {/* Accept Button */}
        <Button
          onClick={handleAcceptRequest}
          disabled={isProcessing}
          className={`
            ${config.button}
            bg-green-600 hover:bg-green-700 text-white flex-1
          `}
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={config.icon} />
          ) : (
            <Check size={config.icon} />
          )}
          <span className="ml-2">Accept</span>
        </Button>
        
        {/* Decline Button */}
        <Button
          onClick={handleDeclineRequest}
          disabled={isProcessing}
          variant="outline"
          className={`
            ${config.button}
            border-red-500/50 text-red-400
            hover:bg-red-500/20 hover:border-red-500 flex-1
          `}
        >
          <X size={config.icon} />
          <span className="ml-2">Decline</span>
        </Button>
      </div>
    );
  }

  // ==========================================================================
  // CONNECTED → "Connected" with remove option
  // ==========================================================================
  if (status === ConnectionStatus.CONNECTED) {
    // Show confirmation
    if (showRemoveConfirm) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <span className="text-xs text-gray-400">Remove connection?</span>
          <Button
            onClick={handleRemoveConnection}
            disabled={isProcessing}
            size="sm"
            variant="destructive"
            className="h-8 px-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
          </Button>
          <Button
            onClick={() => setShowRemoveConfirm(false)}
            size="sm"
            variant="outline"
            className="h-8 px-2 border-gray-600 text-black"
          >
            <X size={14} />
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={() => setShowRemoveConfirm(true)}
        variant="outline"
        className={`
          ${config.button}
          border-green-500/50 bg-green-500 text-white
          hover:bg-white hover:text-green-700 hover:border-green-700
          ${className}
        `}
        title="Click to remove connection"
      >
        <UserCheck size={config.icon} />
        <span className="ml-2">Connected</span>
      </Button>
    );
  }

  return null;
}

export default ConnectionButton;