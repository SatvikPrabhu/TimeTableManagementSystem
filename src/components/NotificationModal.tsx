'use client';

import React, { useState } from 'react';
import { Notification } from '../types/ttms';
import { X, Bell, CheckCheck, Clock, Send, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onBroadcastNotification?: (message: string, sendEmail: boolean) => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onBroadcastNotification,
}: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'broadcast'>('view');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendAsEmail, setSendAsEmail] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSending(true);
    setBroadcastStatus(null);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Timetable Notification Broadcast',
          message: broadcastMessage,
          sendEmail: sendAsEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch broadcast');

      setBroadcastStatus('Notification & Email Alert sent successfully!');
      if (onBroadcastNotification) {
        onBroadcastNotification(broadcastMessage, sendAsEmail);
      }
      setBroadcastMessage('');
      setTimeout(() => {
        setBroadcastStatus(null);
        setActiveTab('view');
      }, 1500);
    } catch (err: any) {
      setBroadcastStatus(`Error: ${err.message || 'Failed to send'}`);
    } finally {
      setIsSending(false);
    }
  };

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
                System Broadcast & Faculty Email Dispatch (D6)
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'view'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Inbox Messages ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
              activeTab === 'broadcast'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Broadcast Email & Alert</span>
          </button>
        </div>

        {activeTab === 'view' ? (
          <>
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
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No notifications recorded yet.
                </div>
              ) : (
                notifications.map((notif) => (
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
                ))
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSendBroadcast} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Broadcast Notification Message
              </label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. Please note that tomorrow's morning schedule will have lab room maintenance."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-700">
                  Send copy to Faculty Gmail inbox
                </span>
              </div>
              <input
                type="checkbox"
                checked={sendAsEmail}
                onChange={(e) => setSendAsEmail(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {broadcastStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium flex items-center space-x-2 ${
                  broadcastStatus.startsWith('Error')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {broadcastStatus.startsWith('Error') ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{broadcastStatus}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !broadcastMessage.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Sending...' : 'Dispatch to Faculty'}</span>
              </button>
            </div>
          </form>
        )}

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
