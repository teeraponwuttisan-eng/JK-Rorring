import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Share2, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { NotificationLog, ProcurementRequest } from '../types/procurement';

interface NotificationViewProps {
  notifications: NotificationLog[];
  requests: ProcurementRequest[];
}

export const NotificationView: React.FC<NotificationViewProps> = ({ notifications, requests }) => {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'LINE Notify' | 'Microsoft Teams' | 'Email'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (selectedChannel === 'all') return true;
    return n.channel === selectedChannel;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
              <Bell className="w-3.5 h-3.5" />
              <span>Multi-Channel Notification Gateway</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-2">
              ระบบแจ้งเตือนผู้มีอำนาจอนุมัติ (LINE Notify / MS Teams / Email)
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              เมื่อมีการส่งคำขอแต่งตั้งคณะกรรมการ หรือส่งต่อเอกสารไปยังลำดับถัดไป ระบบจะส่งการแจ้งเตือนแบบเรียลไทม์พร้อมปุ่มกด One-Click Approval เข้าสู่อุปกรณ์ของผู้บริหารทันที
            </p>
          </div>
        </div>
      </div>

      {/* Channel Switcher */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setSelectedChannel('all')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all ${
            selectedChannel === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white/90 border border-sky-100 text-slate-600 hover:bg-sky-50'
          }`}
        >
          ทุกช่องทาง ({notifications.length})
        </button>
        <button
          onClick={() => setSelectedChannel('LINE Notify')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center space-x-1.5 ${
            selectedChannel === 'LINE Notify'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white/90 border border-sky-100 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>LINE Notify</span>
        </button>
        <button
          onClick={() => setSelectedChannel('Microsoft Teams')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center space-x-1.5 ${
            selectedChannel === 'Microsoft Teams'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white/90 border border-sky-100 text-indigo-800 hover:bg-indigo-50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Microsoft Teams (Webhook)</span>
        </button>
        <button
          onClick={() => setSelectedChannel('Email')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all flex items-center space-x-1.5 ${
            selectedChannel === 'Email'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white/90 border border-sky-100 text-blue-800 hover:bg-blue-50'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Corporate Email</span>
        </button>
      </div>

      {/* Notification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotifs.map((notif) => {
          const isLine = notif.channel === 'LINE Notify';
          const isTeams = notif.channel === 'Microsoft Teams';
          const isEmail = notif.channel === 'Email';

          return (
            <div
              key={notif.id}
              className={`rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                isLine ? 'bg-emerald-50/30 border-emerald-200/80' :
                isTeams ? 'bg-indigo-50/30 border-indigo-200/80' :
                'bg-sky-50/30 border-sky-200/80'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center space-x-1.5 ${
                    isLine ? 'bg-emerald-600 text-white' :
                    isTeams ? 'bg-indigo-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {isLine && <Smartphone className="w-3 h-3" />}
                    {isTeams && <MessageSquare className="w-3 h-3" />}
                    {isEmail && <Mail className="w-3 h-3" />}
                    <span>{notif.channel}</span>
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{notif.sentAt}</span>
                  </span>
                </div>

                {/* Subject & Recipient */}
                <div>
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{notif.subject}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ถึง: <strong className="text-slate-700 font-semibold">{notif.recipientName}</strong> ({notif.recipientEmail})
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-sky-100 text-xs text-slate-700 leading-relaxed shadow-xs font-sans">
                  {notif.messageBody}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ส่งข้อความสำเร็จ (Delivered)</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">Gateway API 200 OK</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
