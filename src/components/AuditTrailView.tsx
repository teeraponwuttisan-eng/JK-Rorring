import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Globe, 
  CheckCircle2, 
  Key, 
  Lock,
  FileText,
  Sparkles
} from 'lucide-react';
import { AuditLogEntry } from '../types/procurement';
import { formatThaiDate } from '../utils/formatters';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Info */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable Audit Trail & Security Ledger</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-2">
              ประวัติการทำรายการและตรวจสอบย้อนกลับ (Audit Trail & Verification)
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              บันทึกทุกกิจกรรมการสร้างคำขอ, การลงนามอนุมัติดิจิทัล, การโอนสิทธิ์แทน (Exception), และการนำออกเอกสาร พร้อมตราประทับเวลา (Timestamp) IP Address และ Hash Checksum ตามมาตรฐาน ISO/IEC 27001
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามเลขที่เอกสาร, ผู้ลงนาม, หรือรายละเอียด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-sky-50/40 border border-sky-200/80 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">ประเภทเหตุการณ์:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs bg-sky-50/40 border border-sky-200/80 rounded-xl px-3.5 py-2 text-slate-700 focus:bg-white font-medium"
          >
            <option value="all">ทุกกิจกรรม (All Actions)</option>
            <option value="APPROVE">APPROVE (ลงนามอนุมัติ)</option>
            <option value="SUBMIT_FOR_APPROVAL">SUBMIT (ยื่นขออนุมัติ)</option>
            <option value="DELEGATE_SUCCESSOR">DELEGATE (โอนสิทธิ์แทน)</option>
            <option value="NOTIFY_DISPATCH">NOTIFY (ส่งการแจ้งเตือน)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 shadow-xs overflow-hidden">
        <div className="divide-y divide-sky-100">
          {filteredLogs.map((log) => {
            let actionBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (log.action === 'APPROVE') actionBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (log.action === 'SUBMIT_FOR_APPROVAL') actionBadgeColor = 'bg-sky-50 text-blue-800 border-sky-200';
            if (log.action === 'DELEGATE_SUCCESSOR') actionBadgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
            if (log.action === 'NOTIFY_DISPATCH') actionBadgeColor = 'bg-amber-50 text-amber-900 border-amber-200';

            return (
              <div key={log.id} className="p-4 hover:bg-sky-50/40 transition text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold border text-[10px] ${actionBadgeColor}`}>
                      {log.action}
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                      {log.documentNo}
                    </span>
                    <span className="text-slate-600 font-semibold">• {log.actorName}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed pl-1">
                  {log.details}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1.5 border-t border-sky-100/60 font-mono">
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>IP: {log.ipAddress}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span>Hash Checksum: {log.hashSignature}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
