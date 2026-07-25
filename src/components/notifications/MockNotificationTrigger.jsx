import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { AlertTriangle, DollarSign, AtSign, CheckSquare, BellPlus, X } from 'lucide-react';

const MockNotificationTrigger = () => {
  const [isOpen, setIsOpen] = useState(true);

  // Toggle presentation mode with Ctrl + Shift + M
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerMock = (type) => {
    const baseNotif = {
      id: `mock_${Date.now()}`,
      created_at: new Date().toISOString(),
      is_read: false,
      user_id: "mock_user_1",
      actor_avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + Math.random()
    };

    let notification;

    switch (type) {
      case 'warning':
        notification = {
          ...baseNotif,
          title: "System Warning",
          message: "High CPU usage detected on backend server. Please investigate immediately.",
          type: "warning",
          category: "system",
          priority: "high",
        };
        break;
      case 'payout':
        notification = {
          ...baseNotif,
          title: "Payout Successful",
          message: "Your monthly milestone payout of $5,000 has been transferred to your wallet.",
          type: "success",
          category: "financial",
        };
        break;
      case 'mention':
        notification = {
          ...baseNotif,
          title: "New Mention",
          message: "@founder mentioned you in the project task 'Update Landing Page'.",
          type: "info",
          category: "mention",
        };
        break;
      case 'task':
        notification = {
          ...baseNotif,
          title: "Task Reminder",
          message: "Deadline approaching: 'Submit Q3 Financial Report' is due tomorrow.",
          type: "info",
          category: "task",
        };
        break;
    }

    // Dispatch a custom DOM event that NotificationContext will listen to
    window.dispatchEvent(
      new CustomEvent("mock_notification", {
        detail: { notification },
      })
    );
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        title="Mock Notifications (Ctrl+Shift+M)"
        className="fixed bottom-4 right-4 z-[9999] p-3 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-transform hover:scale-110"
      >
        <BellPlus size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col gap-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2" title="Press Ctrl+Shift+M to toggle">
          <BellPlus size={14} /> Mock Notifications <span className="text-[10px] text-slate-600 lowercase font-normal">(ctrl+shift+m)</span>
        </span>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white" title="Minimize">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => triggerMock('warning')} className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30" title="Trigger Warning"><AlertTriangle size={18}/></button>
        <button onClick={() => triggerMock('payout')} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30" title="Trigger Payout"><DollarSign size={18}/></button>
        <button onClick={() => triggerMock('mention')} className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30" title="Trigger Mention"><AtSign size={18}/></button>
        <button onClick={() => triggerMock('task')} className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30" title="Trigger Task"><CheckSquare size={18}/></button>
      </div>
    </div>
  );
};

export default MockNotificationTrigger;
