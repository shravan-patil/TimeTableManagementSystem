'use client';

import React from 'react';
import { Notification } from '../types/ttms';
import { X, Bell, CheckCheck, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Campus Change Notifications</h3>
              <p className="text-[11px] text-slate-300 font-mono">
                System Broadcast Data Store (D6)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {notifications.length} Total Messages
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Notifications list */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.map((notif) => (
            <div
              key={notif.Notif_ID}
              className={`p-3.5 rounded-xl transition-all ${
                notif.Is_Read ? 'bg-white text-slate-700' : 'bg-indigo-50/50 text-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs leading-relaxed font-medium">{notif.Message}</p>
                {!notif.Is_Read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                )}
              </div>
              <div className="mt-2 flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>{notif.Sent_On}</span>
                <span>•</span>
                <span>To: {notif.Recipient_ID}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

