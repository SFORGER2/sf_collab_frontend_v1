import { API_URL } from '@/utils/config';
import { useState } from 'react';
// Swipe Action Modal Component
export default function SwipeActionModal({ user, onClose, onFriendRequest, onMessage }) {
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFriendRequest = async () => {
    setLoading(true);
    await onFriendRequest(user?.id);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await onMessage(user?.id, message);
    setLoading(false);
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 
                      animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {user?.profile?.picture ? (
              <img
                src={`${API_URL}${user?.profile?.picture}`}
                alt={user?.fullName}
                className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">Connect with {user?.firstName}</h3>
              <p className="text-sm text-gray-400">{user?.profile?.company || 'No company'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showMessageBox ? (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm mb-4">
                Choose how you'd like to connect with {user?.firstName}
              </p>
              
              <button
                onClick={handleFriendRequest}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 
                         hover:to-cyan-500 text-white rounded-xl font-medium transition-all duration-200 
                         flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Send Friend Request
                  </>
                )}
              </button>

              <button
                onClick={() => setShowMessageBox(true)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl 
                         font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Send Message
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          ) : (
            <MessageBox
              value={message}
              onChange={setMessage}
              onSend={handleSendMessage}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
