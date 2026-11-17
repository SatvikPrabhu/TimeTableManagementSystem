'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Bell, History } from 'lucide-react';

interface NotificationBroadcastViewProps {
  notifications: any[];
  onAddNotification?: (notif: any) => void;
}

export default function NotificationBroadcastView({
  notifications,
  onAddNotification,
}: NotificationBroadcastViewProps) {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendAsEmail, setSendAsEmail] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle || 'Timetable Notification Broadcast',
          message: broadcastMessage,
          sendEmail: sendAsEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch notification');

      setStatusMessage('Alert broadcast recorded and faculty email notification dispatched!');
      if (onAddNotification && data.notification) {
        onAddNotification(data.notification);
      }
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Dispatch failed'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Mail className="w-4 h-4" />
            <span>Process 6.0 (D6 Broadcast Queue)</span>
          </div>
          <h2 className="text-xl font-bold">Faculty Broadcast & Email Alert Dispatcher</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Only Department Coordinators can send campus announcements and timetable notifications to
            faculty members&apos; Gmail inboxes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-4">
            <Send className="w-4 h-4 text-indigo-600" />
            <span>Compose Notification / Email Alert</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notification Subject / Title (Optional)
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Tomorrow Schedule Adjustment / Room Change"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Broadcast Message Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your official announcement here. It will be posted to the institutional notification board and dispatched to faculty..."
                className="w-full border border-slate-300 rounded-xl p-3.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Send copy to Faculty Gmail inboxes</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Dispatches an email alert with official VJTI formatting.
                </p>
              </div>
              <input
                type="checkbox"
                checked={sendAsEmail}
                onChange={(e) => setSendAsEmail(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
                  statusMessage.startsWith('Error')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {statusMessage.startsWith('Error') ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSending || !broadcastMessage.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching...' : 'Dispatch Broadcast to Faculty'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Broadcasts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
            <History className="w-4 h-4 text-slate-500" />
            <span>Recent Broadcasts ({notifications.length})</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No past broadcasts recorded yet.
              </div>
            ) : (
              notifications.slice(0, 10).map((n: any, idx: number) => (
                <div
                  key={n.Notif_ID || n.notif_id || idx}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs"
                >
                  <p className="font-semibold text-slate-800 leading-snug">
                    {n.Message || n.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>To: {n.Recipient_ID || n.recipient_id || 'All Faculty'}</span>
                    <span>{new Date(n.Sent_On || n.sent_on || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
