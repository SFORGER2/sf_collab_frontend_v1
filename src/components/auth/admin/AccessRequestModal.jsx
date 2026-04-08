import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Textarea } from "../../ui/textarea";

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AccessRequestModal = ({ isOpen, onClose, permissionKey }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, title: "", description: "", variant: "default" });
  const { user } = useSelector((state) => state.auth);

  const showAlert = (title, description, variant = "default") => {
    setAlert({ show: true, title, description, variant });
  };

  const hideAlert = () => {
    setAlert({ show: false, title: "", description: "", variant: "default" });
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showAlert("Error", "Please provide a reason for your access request", "destructive");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, we need to find the permission ID by key
      const token = localStorage.getItem("access_token");
      
      // Get all permissions to find the ID
      const permissionsResponse = await fetch(`${API_URL}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        const permission = permissionsData.data.permissions.find(p => p.key === permissionKey);
        
        if (!permission) {
          throw new Error("Permission not found");
        }

        // Submit the access request
        const response = await fetch(`${API_URL}/access-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            permission_id: permission.id,
            reason: reason
          })
        });

        if (response.ok) {
          showAlert("Success", "Access request submitted successfully. An administrator will review your request.");
          setTimeout(() => {
            onClose();
            setReason("");
            hideAlert();
          }, 4000);
        } else {
          const error = await response.json();
          showAlert("Error", error.message);
          setTimeout(() => {
            onClose();
            setReason("");
            hideAlert();
          }, 4000);
          throw new Error(error.message || "Failed to submit request");
        }
      }
    } catch (error) {
      showAlert("Error", error.message || "Failed to submit access request", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Alert Component */}
      {alert.show && (
        <div style={{zIndex:99999999999}} className="fixed top-10 left-4 z-50 max-w-md">
          <Alert variant={alert.variant}>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideAlert}
              className="absolute top-2 right-2"
            >
              ×
            </Button>
          </Alert>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request Access</DialogTitle>
            <DialogDescription className="text-gray-600">
              You're requesting access to: <span className="font-semibold">{permissionKey}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Why do you need this access?
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain your need for this permission..."
                className="min-h-[120px] resize-none bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-black text-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-gray-800 shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccessRequestModal;