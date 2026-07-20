/**
 * ToastNotification Component
 * Toast popups for real-time notifications
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Listen for toast events from NotificationContext
    const handleShowToast = (event) => {
      const { type, title, message, data } = event.detail;
      
      const newToast = {
        id: Date.now(),
        type,
        title,
        message,
        data,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeToast(newToast.id);
      }, 5000);
    };

    window.addEventListener('showToast', handleShowToast);

    return () => {
      window.removeEventListener('showToast', handleShowToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" size={20} />;
      case 'info':
        return <Info className="toast-icon" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-icon" size={20} />;
      case 'error':
        return <AlertCircle className="toast-icon" size={20} />;
      default:
        return <Info className="toast-icon" size={20} />;
    }
  };

  return (
    <div className="toast-container z-1000">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-content">
            <div className="toast-icon-wrapper">{getIcon(toast.type)}</div>
            
            <div className="toast-text">
              <h4 className="toast-title">{toast.title}</h4>
              <p className="toast-message">{toast.message}</p>
            </div>

            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;