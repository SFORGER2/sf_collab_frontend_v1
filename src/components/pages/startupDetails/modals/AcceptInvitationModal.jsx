import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, CheckCircle2, XCircle } from "lucide-react";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

const AcceptInvitationModal = ({
  isOpen,
  onClose,
  startupName,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="w-full max-w-md px-4"
        >
          <Card className="bg-gray-900 border-gray-700 shadow-2xl">
            <CardContent className="p-6 relative">

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-14 h-14 text-blue-500" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-white text-center mb-2">
                Startup Invitation
              </h2>

              {/* Message */}
              <p className="text-gray-400 text-center mb-6">
                You have been invited to join{" "}
                <span className="text-white font-medium">
                  {startupName}
                </span>.
                <br />
                Do you want to accept this invitation?
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-1/2 border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={onDecline}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>

                <Button
                  className="w-1/2 bg-blue-600 hover:bg-blue-700"
                  onClick={onAccept}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AcceptInvitationModal;