import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { authAPI } from '@/utils/APIs/authAPI';
import { useState } from 'react';
import { motion } from 'framer-motion';

const EmailVerifyPopUp = () => {
  const navigate = useNavigate();
  const { user, access_token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const response = await authAPI.sendVerificationCodeRequest(access_token);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      navigate(`/verify-email?token=${response.verification_token}`);
      toast.info("Verification code sent to your email, continue to verify.");

    } catch (err) {
      console.error(err);
      toast.error("An error occurred while resending verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {user && !user.isEmailVerified && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 py-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl flex-shrink-0 mt-1"
              >
                ⚠️
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Email Verification Required
                </h3>
                <p className="text-sm text-gray-600">
                  Please verify your email address to access all features.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Sending...
                </span>
              ) : (
                "Verify Now"
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default EmailVerifyPopUp;
