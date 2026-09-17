import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  Building, 
  ShieldAlert, 
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ProcurementRequest, UserProfile } from '../types/procurement';
import { formatCurrency, formatThaiDate, getStatusBadge } from '../utils/formatters';
import { SomboonLogo } from './SomboonLogo';

interface DashboardViewProps {
  requests: ProcurementRequest[];
  currentUser: UserProfile;
  onSelectRequest: (request: ProcurementRequest) => void;
  onOpenNewRequest: () => void;
  onQuickSign: (request: ProcurementRequest) => void;
  onViewMemo: (request: ProcurementRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  requests,
  currentUser,
  onSelectRequest,
  onOpenNewRequest,
  onQuickSign,
  onViewMemo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'my_pending' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Calculate Metrics
  const totalRequests = requests.length;
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const pendingRequests = requests.filter(r => r.status === 'pending_approval');
  
  // Pending for current user
  const myPendingRequests = requests.filter(r => {
    if (r.status !== 'pending_approval') return false;
    const currentStep = r.approvalWorkflow[r.currentStepIndex];
    return currentStep && currentStep.assignedApproverId === currentUser.id && currentStep.status === 'pending';
  });

  const totalBudgetApproved = approvedRequests.reduce((sum, r) => sum + r.budget, 0);
  const totalBudgetInPipeline = requests.reduce((sum, r) => sum + r.budget, 0);

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestingDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;

    if (!matchesSearch || !matchesCategory) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'my_pending') {
      const currentStep = req.approvalWorkflow[req.currentStepIndex];
      return req.status === 'pending_approval' && currentStep?.assignedApproverId === currentUser.id && currentStep.status === 'pending';
    }
    return req.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Hero Welcome Banner (White/Sky/Blue Soft Modern Gradient) */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#0284c7] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden border border-blue-400/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-300/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-sky-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Somboon Procurement Standard PM-01</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              ระบบตั้งคณะกรรมการและอนุมัติโครงการ
            </h1>
            
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-normal">
              บริหารจัดการการสั่งซื้อและจัดจ้างโครงการที่มีมูลค่าเกิน <strong className="text-amber-300 font-bold">1,000,000 บาท</strong> ตามระเบียบ PM-01 ด้วยการแต่งตั้งคณะกรรมการระดับ Manager 5-6 ท่าน พร้อมสายอนุมัติอิเล็กทรอนิกส์และเอกสารบันทึกข้อความสมบูรณ์แบบ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenNewRequest}
              id="btn-create-request-hero"
              className="bg-white hover:bg-sky-50 text-[#1e3a8a] font-bold px-5 py-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 flex items-center justify-center space-x-2 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>สร้างคำขอแต่งตั้งใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Soft White & Blue Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending For You */}
        <div className={`p-5 rounded-2xl border transition-all ${
          myPendingRequests.length > 0
            ? 'bg-amber-50/90 border-amber-200/90 shadow-sm shadow-amber-500/10'
            : 'bg-white/90 backdrop-blur-md border-sky-100 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">รอคุณลงนามอนุมัติ</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              myPendingRequests.length > 0 ? 'bg-amber-500 text-white shadow-xs' : 'bg-sky-50 text-sky-600'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{myPendingRequests.length}</span>
            <span className="text-xs text-slate-500">โครงการ</span>
          </div>
          <div className="mt-2 text-[11px]">
            {myPendingRequests.length > 0 ? (
              <span className="text-amber-800 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>มีเอกสารรอพิจารณาลงนาม</span>
              </span>
            ) : (
              <span className="text-slate-400">ไม่มีรายการค้างพิจารณาสำหรับคุณ</span>
            )}
          </div>
        </div>

        {/* Total In Pipeline */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">โครงการทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalRequests}</span>
            <span className="text-xs text-slate-500">โครงการ</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            กำลังพิจารณา: <span className="font-bold text-blue-600">{pendingRequests.length}</span> รายการ
          </div>
        </div>

        {/* Approved Count */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">อนุมัติเรียบร้อยแล้ว</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{approvedRequests.length}</span>
            <span className="text-xs text-slate-500">โครงการ</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            มูลค่าที่อนุมัติ: <span className="font-bold text-emerald-600">{(totalBudgetApproved / 1000000).toFixed(2)} MB</span>
          </div>
        </div>

        {/* Total Capex Value */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">มูลค่างบประมาณรวม</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-blue-900 tracking-tight">{(totalBudgetInPipeline / 1000000).toFixed(2)}</span>
            <span className="text-xs text-slate-500">ล้านบาท</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            เฉลี่ยเวลาอนุมัติ: <strong className="text-slate-700">1.8 วันทำการ</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาตามชื่อโครงการ, เลขที่บันทึกข้อความ, หรือหน่วยงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="input-search-requests"
              className="w-full pl-10 pr-4 py-2 bg-sky-50/50 border border-sky-200/70 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">หมวดหมู่:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-sky-50/50 border border-sky-200/70 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
            >
              <option value="all">ทุกหมวดหมู่งาน (All Categories)</option>
              <option value="Engineering & Machinery">Engineering & Machinery</option>
              <option value="Energy & Utilities">Energy & Utilities</option>
              <option value="Supply Chain Logistics">Supply Chain Logistics</option>
              <option value="IT & Digital Infrastructure">IT & Digital Infrastructure</option>
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-sky-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">สถานะ:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1 rounded-full font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter('my_pending')}
            className={`px-3.5 py-1 rounded-full font-medium transition-all flex items-center space-x-1.5 ${
              statusFilter === 'my_pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>รอฉันลงนาม</span>
            <span className="bg-amber-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {myPendingRequests.length}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('pending_approval')}
            className={`px-3.5 py-1 rounded-full font-medium transition-all ${
              statusFilter === 'pending_approval'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-sky-50 text-blue-700 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            กำลังรออนุมัติ ({pendingRequests.length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3.5 py-1 rounded-full font-medium transition-all ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            อนุมัติแล้ว ({approvedRequests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3.5">
        {filteredRequests.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-12 text-center shadow-xs">
            <FileText className="w-12 h-12 text-sky-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">ไม่พบรายการคำขอที่ค้นหา</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา หรือกดปุ่มสร้างคำขอแต่งตั้งคณะกรรมการใหม่
            </p>
            <button
              onClick={onOpenNewRequest}
              className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-blue-500 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างคำขอใหม่</span>
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const badge = getStatusBadge(req.status);
            const currentStep = req.approvalWorkflow[req.currentStepIndex];
            const isMyTurnToSign = 
              req.status === 'pending_approval' && 
              currentStep?.assignedApproverId === currentUser.id && 
              currentStep.status === 'pending';

            const hasDelegatedMember = req.committeeMembers.some(m => m.isDelegated);

            return (
              <div
                key={req.id}
                className={`bg-white/95 backdrop-blur-md rounded-2xl border transition-all p-5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 ${
                  isMyTurnToSign ? 'border-amber-300 ring-2 ring-amber-100/80 bg-amber-50/20' : 'border-sky-100/90 shadow-xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/80">
                        {req.documentNo}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">
                        {req.category}
                      </span>
                      {hasDelegatedMember && (
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3 text-purple-500" />
                          <span>มีโอนสิทธิ์กรรมการแทน (Exception Active)</span>
                        </span>
                      )}
                    </div>

                    <h2 
                      onClick={() => onSelectRequest(req)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition leading-snug"
                    >
                      {req.title}
                    </h2>

                    <div className="flex flex-wrap items-center text-xs text-slate-500 gap-y-1 gap-x-4">
                      <div className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-blue-500" />
                        <span>{req.requestingDepartment}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>กรรมการ {req.committeeMembers.length} ท่าน (ครบเกณฑ์ PM-01)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>สร้างเมื่อ {formatThaiDate(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Budget & Action */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-400 font-medium">วงเงินงบประมาณโครงการ</div>
                      <div className="text-lg font-black tracking-tight text-[#1e3a8a]">
                        {formatCurrency(req.budget)}
                      </div>
                    </div>

                    {/* Step indicator tag */}
                    {req.status === 'pending_approval' && currentStep && (
                      <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center space-x-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>รออนุมัติขั้นที่ {currentStep.stepNumber}: <strong>{currentStep.assignedApprover.name}</strong></span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => onViewMemo(req)}
                        title="ดูและพิมพ์บันทึกข้อความภายใน (Internal Memo)"
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-sky-50 rounded-xl border border-sky-200/80 transition shadow-2xs"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {isMyTurnToSign ? (
                        <button
                          onClick={() => onQuickSign(req)}
                          id={`btn-sign-${req.id}`}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ลงนามอนุมัติ (Sign)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectRequest(req)}
                          className="bg-sky-50 hover:bg-sky-100 text-blue-900 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center space-x-1 border border-sky-200/60"
                        >
                          <span>ดูรายละเอียด</span>
                          <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workflow Progress Micro-Bar */}
                <div className="mt-4 pt-3 border-t border-sky-100">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>เส้นทางการอนุมัติ (Approval Chain {req.approvalWorkflow.length} ขั้นตอน):</span>
                    <span>{req.approvalWorkflow.filter(s => s.status === 'approved').length} / {req.approvalWorkflow.length} เสร็จสิ้น</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {req.approvalWorkflow.map((step, idx) => {
                      let barColor = 'bg-slate-100 text-slate-400 border border-slate-200/60';
                      if (step.status === 'approved') barColor = 'bg-emerald-600 text-white font-semibold shadow-2xs';
                      if (step.status === 'pending') barColor = 'bg-amber-500 text-white font-bold animate-pulse shadow-2xs';
                      if (step.status === 'rejected') barColor = 'bg-rose-500 text-white font-bold';

                      return (
                        <div key={idx} className="relative group">
                          <div className={`text-[10px] py-1 px-1.5 rounded-lg text-center truncate ${barColor}`}>
                            {step.stepNumber}. {step.assignedApprover.name.split(' ')[0]} ({step.assignedApprover.level})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
