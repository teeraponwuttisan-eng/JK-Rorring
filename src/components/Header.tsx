import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Bell, 
  UserCheck, 
  CheckCircle2, 
  Layers, 
  FileText, 
  ScrollText, 
  Sliders, 
  Code2, 
  PlusCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types/procurement';
import { mockUsers } from '../data/mockData';
import { SomboonLogo } from './SomboonLogo';

interface HeaderProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCountForUser: number;
  onOpenNewRequest: () => void;
  onOpenSpecsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  activeTab,
  onTabChange,
  pendingCountForUser,
  onOpenNewRequest,
  onOpenSpecsModal,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-800 border-b border-sky-100 sticky top-0 z-40 shadow-xs transition-all">
      {/* Top Banner with Somboon Official Identity & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          
          {/* Somboon Logo & System Title */}
          <div className="flex items-center space-x-4">
            <SomboonLogo variant="horizontal" size="md" />
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-800 tracking-tight">
                  ระบบตั้งคณะกรรมการและอนุมัติโครงการ
                </span>
                <span className="text-[11px] bg-sky-50 text-blue-700 border border-sky-200/80 px-2 py-0.5 rounded-full font-semibold">
                  PM-01 Digital Workflow
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Somboon Group e-Procurement & Digital Approval System
              </p>
            </div>
          </div>

          {/* Right Action: New Request & Persona Switcher */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewRequest}
              id="btn-header-new-request"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>สร้างคำขอแต่งตั้งใหม่</span>
            </button>

            {/* Persona Switcher Dropdown (Soft Style) */}
            <div className="bg-sky-50/70 border border-sky-200/60 rounded-xl p-1.5 flex items-center space-x-2 shadow-2xs">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                {currentUser.status === 'active' && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                <div className="text-[10.5px] text-slate-500 truncate max-w-[130px] leading-tight">{currentUser.position}</div>
              </div>
              <div className="pl-1 border-l border-sky-200">
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const selected = mockUsers.find(u => u.id === e.target.value);
                    if (selected) onUserChange(selected);
                  }}
                  id="select-user-persona"
                  className="bg-white text-xs font-semibold text-blue-800 border border-sky-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
                  aria-label="เปลี่ยนผู้ใช้งานจำลอง (Role Switcher)"
                >
                  <optgroup label="สายการอนุมัติหลัก (Executive & Purchasing)">
                    <option value="usr-001">คุณสมชาย ใจมั่น (Manager Purchasing / ผู้ขอ)</option>
                    <option value="usr-002">คุณจตุรงค์ บุญนำ (AGM Supply Chain)</option>
                    <option value="usr-003">คุณพัฒน์พงษ์ วีระศิลป์ (VP Supply Chain)</option>
                    <option value="usr-004">คุณวิชัย รัตนสกุล (President & CEO)</option>
                  </optgroup>
                  <optgroup label="คณะกรรมการ & กรรมการสังเกตการณ์">
                    <option value="usr-005">คุณกิตติศักดิ์ สุขสวัสดิ์ (Manager Plant / ประธาน)</option>
                    <option value="usr-008">คุณนภาพร วงศ์สว่าง (Internal Audit / สังเกตการณ์)</option>
                    <option value="usr-011">คุณอรรถพล เจริญผล (รักษาการแทน / Proxy)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* System Specs Modal Trigger */}
            <button
              onClick={onOpenSpecsModal}
              title="ดูสถาปัตยกรรมระบบและเอกสารความต้องการ (System Specs & ERD)"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-sky-50 rounded-xl transition border border-transparent hover:border-sky-100"
            >
              <Code2 className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-sky-100 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50/80'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>แดชบอร์ดและรายการขออนุมัติ</span>
            {pendingCountForUser > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'dashboard' ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-white'
              }`}>
                {pendingCountForUser}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('authority_matrix')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'authority_matrix'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50/80'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ผังอำนาจดำเนินการ (Authority Matrix PM-01)</span>
          </button>

          <button
            onClick={() => onTabChange('audit_trail')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'audit_trail'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ประวัติการอนุมัติ (Audit Trail & Security)</span>
          </button>

          <button
            onClick={() => onTabChange('notifications')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-blue-700 hover:bg-sky-50/80'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>ระบบแจ้งเตือน (Email / LINE / Teams)</span>
          </button>

          <button
            onClick={onOpenSpecsModal}
            className="px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap text-blue-700 hover:text-blue-800 hover:bg-sky-50 ml-auto border border-sky-200/80 bg-sky-50/40"
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>System Specs & Backend</span>
          </button>
        </div>
      </div>
    </header>
  );
};
