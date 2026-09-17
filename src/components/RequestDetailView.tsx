import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users, 
  ShieldCheck, 
  Printer, 
  Building, 
  DollarSign, 
  Calendar, 
  Check, 
  X, 
  MessageSquare, 
  FileDown, 
  Share2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  QrCode,
  Award,
  ClipboardCheck,
  ThumbsUp,
  FileCheck2,
  Lock,
  UserCheck
} from 'lucide-react';
import { ProcurementRequest, UserProfile, ApprovalStep } from '../types/procurement';
import { formatCurrency, formatThaiDate, getStatusBadge, getRoleLabelThai, thaiBahtText } from '../utils/formatters';
import { getCategoryMeta } from '../data/categories';
import { InternalMemoDocument } from './InternalMemoDocument';
import { SomboonLogo } from './SomboonLogo';

interface RequestDetailViewProps {
  request: ProcurementRequest;
  currentUser: UserProfile;
  onBack: () => void;
  onOpenSignatureModal: (request: ProcurementRequest, step: ApprovalStep) => void;
  onRejectRequest: (request: ProcurementRequest, reason: string) => void;
  onRequestRevision: (request: ProcurementRequest, comment: string) => void;
  onSimulateException: (request: ProcurementRequest, memberUserId: string) => void;
}

export const RequestDetailView: React.FC<RequestDetailViewProps> = ({
  request,
  currentUser,
  onBack,
  onOpenSignatureModal,
  onRejectRequest,
  onRequestRevision,
  onSimulateException,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'committee_approval' | 'workflow' | 'memo'>('committee_approval');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [showRevisionBox, setShowRevisionBox] = useState(false);

  // Local state for committee votes
  const [committeeVotes, setCommitteeVotes] = useState<Record<string, { status: 'approved' | 'noted' | 'pending'; score: number; comment: string; signedAt?: string }>>({
    'usr-005': { status: 'approved', score: 96, comment: 'ผ่านเกณฑ์ข้อกำหนดด้านเทคนิคและประสิทธิภาพเครื่องจักรครบถ้วนตาม TOR', signedAt: '16 ก.ย. 2569 11:30' },
    'usr-006': { status: 'approved', score: 92, comment: 'สเปคตรงตามแบบโรงงาน วางระบบความปลอดภัยได้ตามมาตรฐานสากล', signedAt: '16 ก.ย. 2569 13:15' },
    'usr-007': { status: 'approved', score: 90, comment: 'ผ่านการตรวจสอบความคุ้มค่าและ ROI ระยะเวลาคืนทุน 2.4 ปี', signedAt: '16 ก.ย. 2569 14:00' },
    'usr-009': { status: 'approved', score: 94, comment: 'ผ่านเกณฑ์การบำรุงรักษา มีอะไหล่สำรองและ Warranty 3 ปี', signedAt: '16 ก.ย. 2569 14:45' },
    'usr-001': { status: 'approved', score: 95, comment: 'ยืนยันความถูกต้องของ TOR และเงื่อนไขสัญญาจัดจ้าง', signedAt: '16 ก.ย. 2569 10:00' },
    'usr-008': { status: 'approved', score: 98, comment: 'กระบวนการคัดเลือกเป็นไปตามระเบียบ PM-01 โปร่งใส ตรวจสอบได้', signedAt: '16 ก.ย. 2569 15:20' },
    'usr-010': { status: 'approved', score: 95, comment: 'รวบรวมเอกสารการประชุมและบันทึกมติคณะกรรมการครบถ้วนสมบูรณ์', signedAt: '16 ก.ย. 2569 15:30' }
  });

  const catMeta = getCategoryMeta(request.category);
  const badge = getStatusBadge(request.status);
  const currentStep = request.approvalWorkflow[request.currentStepIndex];
  
  // Check if it is current user's turn to approve
  const isMyTurn = 
    request.status === 'pending_approval' && 
    currentStep && 
    currentStep.assignedApproverId === currentUser.id && 
    currentStep.status === 'pending';

  // Toggle user's vote if user is in committee
  const isCurrentUserInCommittee = request.committeeMembers.some(m => m.userId === currentUser.id);

  const handleMemberVote = (memberUserId: string, status: 'approved' | 'noted') => {
    setCommitteeVotes(prev => ({
      ...prev,
      [memberUserId]: {
        status,
        score: status === 'approved' ? 95 : 80,
        comment: status === 'approved' ? 'เห็นชอบผ่านเกณฑ์การพิจารณาคัดเลือก' : 'มีข้อสังเกตเพิ่มเติมด้านการส่งมอบ',
        signedAt: new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
      }
    }));
  };

  const totalMembers = request.committeeMembers.length;
  const approvedMembersCount = request.committeeMembers.filter(m => (committeeVotes[m.userId]?.status || 'approved') === 'approved').length;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-sky-50 rounded-xl transition border border-transparent hover:border-sky-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/80">
                {request.documentNo}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.badgeBorder}`}>
                {catMeta.labelTh}
              </span>
              {request.urgentLevel !== 'normal' && (
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  {request.urgentLevel === 'very_urgent' ? '⚡ ด่วนที่สุด' : '🔥 ด่วน'}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{request.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <button
            onClick={() => setActiveTab('memo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'memo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-sky-50 text-blue-800 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>บันทึกข้อความทางการ (Internal Memo)</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-sky-100 text-xs font-medium">
        <button
          onClick={() => setActiveTab('committee_approval')}
          className={`pb-3 px-3.5 transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'committee_approval'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>หน้า อนุมัติ / มติของคณะกรรมการ (Committee Review & Approval)</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {approvedMembersCount}/{totalMembers}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-3.5 transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>รายละเอียดโครงการ & คณะกรรมการ</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`pb-3 px-3.5 transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'workflow'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>สายการอนุมัติดิจิทัล (Authority Chain)</span>
        </button>

        <button
          onClick={() => setActiveTab('memo')}
          className={`pb-3 px-3.5 transition-all border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'memo'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>ตัวอย่างเอกสารบันทึกข้อความ (PDF Print)</span>
        </button>
      </div>

      {/* APPROVAL ACTION BAR (If it's current user's turn) */}
      {isMyTurn && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-6 shadow-md shadow-amber-500/10 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-950 font-bold text-base">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                <span>ถึงลำดับการลงนามอนุมัติของท่าน: ขั้นที่ {currentStep.stepNumber} ({currentStep.roleTitle})</span>
              </div>
              <p className="text-xs text-amber-900/80 mt-1">
                ท่านเข้าสู่ระบบในฐานะ <strong className="underline font-bold">{currentUser.name}</strong> ({currentUser.position}) กรุณาตรวจสอบผลการพิจารณาของคณะกรรมการก่อนลงนาม
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenSignatureModal(request, currentStep)}
                id="btn-sign-primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ลงนามอนุมัติ (E-Signature)</span>
              </button>

              <button
                onClick={() => {
                  setShowRevisionBox(!showRevisionBox);
                  setShowRejectBox(false);
                }}
                className="bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition border border-orange-200"
              >
                ขอให้แก้ไข (Revision)
              </button>

              <button
                onClick={() => {
                  setShowRejectBox(!showRejectBox);
                  setShowRevisionBox(false);
                }}
                className="bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition border border-rose-200"
              >
                ไม่อนุมัติ (Reject)
              </button>
            </div>
          </div>

          {/* Revision Box */}
          {showRevisionBox && (
            <div className="mt-4 pt-4 border-t border-amber-200/80">
              <label className="block text-xs font-bold text-orange-950 mb-1">
                ระบุสิ่งที่ต้องการให้แก้ไข / ปรับปรุงข้อมูล:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="เช่น ขอให้เพิ่มผู้จัดการฝ่าย QC เข้าร่วมเป็นกรรมการ..."
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={() => {
                    if (!revisionComment) return alert('กรุณาระบุข้อความขอแก้ไข');
                    onRequestRevision(request, revisionComment);
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-500 transition shadow-xs"
                >
                  ส่งกลับแก้ไข
                </button>
              </div>
            </div>
          )}

          {/* Reject Box */}
          {showRejectBox && (
            <div className="mt-4 pt-4 border-t border-amber-200/80">
              <label className="block text-xs font-bold text-rose-950 mb-1">
                ระบุเหตุผลที่ไม่อนุมัติโครงการ (Mandatory):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ระบุเหตุผลความไม่สอดคล้องกับระเบียบ PM-01..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  onClick={() => {
                    if (!rejectReason) return alert('กรุณาระบุเหตุผล');
                    onRejectRequest(request, rejectReason);
                  }}
                  className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-500 transition shadow-xs"
                >
                  ยืนยันไม่อนุมัติ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: COMMITTEE APPROVAL & REVIEW PAGE (หน้า อนุมัติ ของคณะกรรมการ) */}
      {activeTab === 'committee_approval' && (
        <div className="space-y-6">
          
          {/* Header Banner for Committee Resolution */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#1e3a8a] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-800 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-sky-200 mb-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>มติผลการพิจารณาและการลงนามของคณะกรรมการ (PM-01 Committee Quorum)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  ผลการพิจารณาและลงนามอนุมัติของคณะกรรมการ {request.committeeMembers.length} ท่าน
                </h2>
                <p className="text-xs text-sky-100/90 mt-1 max-w-2xl">
                  คณะกรรมการคัดเลือกและตรวจรับงานได้ตรวจสอบคุณสมบัติของผู้เสนอราคา ขอบเขตงาน (TOR) ความคุ้มค่าทางเศรษฐศาสตร์ และมาตรฐานความปลอดภัยเรียบร้อยแล้ว
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 self-start md:self-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[11px] text-sky-200 uppercase tracking-wider font-semibold">สถานะมติที่ประชุม</div>
                  <div className="text-base font-bold text-emerald-300">
                    มติเห็นชอบเอกฉันท์ ({approvedMembersCount}/{totalMembers})
                  </div>
                  <div className="text-[10px] text-sky-200">คะแนนประเมินเฉลี่ย: 94.4 / 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Committee Evaluation Criteria Matrix */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-sky-100 shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-sky-100 pb-3">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>เกณฑ์การประเมินและตรวจรับงานโครงการ (Evaluation & Inspection Criteria)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
                <div className="font-bold text-blue-900">1. ข้อกำหนดทางเทคนิค (TOR)</div>
                <div className="text-slate-600 text-[11px] mt-1">สเปคเครื่องจักร/ระบบงานตรงตามเกณฑ์ 100%</div>
                <div className="mt-2 text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ประเมิน</span>
                </div>
              </div>

              <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
                <div className="font-bold text-blue-900">2. ความคุ้มค่างบประมาณ (Cost)</div>
                <div className="text-slate-600 text-[11px] mt-1">อยู่ในกรอบงบ {formatCurrency(request.budget)} (ROI 2.4 ปี)</div>
                <div className="mt-2 text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ประเมิน</span>
                </div>
              </div>

              <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
                <div className="font-bold text-blue-900">3. กำหนดส่งมอบงาน (Lead Time)</div>
                <div className="text-slate-600 text-[11px] mt-1">กำหนดเสร็จ: {request.targetCompletionDate || '31 มี.ค. 2570'}</div>
                <div className="mt-2 text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ประเมิน</span>
                </div>
              </div>

              <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
                <div className="font-bold text-blue-900">4. ธรรมาภิบาล & ESG (PM-01)</div>
                <div className="text-slate-600 text-[11px] mt-1">ตรวจทานโดย IA Napaporn โปร่งใส ไร้ส่วนได้เสีย</div>
                <div className="mt-2 text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ผ่านเกณฑ์ประเมิน</span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Committee Member Approval Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>รายชื่อและลายมือชื่ออิเล็กทรอนิกส์ของคณะกรรมการแต่ละท่าน ({request.committeeMembers.length} ท่าน)</span>
              </h3>
              <div className="text-xs text-slate-500">
                คลิกเพื่อจำลองการลงนามหรือบันทึกความเห็น
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.committeeMembers.map((member, idx) => {
                const vote = committeeVotes[member.userId] || {
                  status: 'approved',
                  score: 95,
                  comment: 'เห็นชอบตามข้อเสนอและระเบียบจัดซื้อจัดจ้าง PM-01',
                  signedAt: '16 ก.ย. 2569 14:00'
                };
                const isChairman = member.role === 'chairman';
                const isObserver = member.role === 'observer';
                const isSecretary = member.role === 'secretary';

                return (
                  <div
                    key={member.id}
                    className={`bg-white/95 backdrop-blur-md rounded-2xl border p-5 shadow-xs transition-all ${
                      isChairman 
                        ? 'border-amber-300 ring-2 ring-amber-100/70 bg-amber-50/10' 
                        : isObserver 
                        ? 'border-sky-300 ring-2 ring-sky-100/70' 
                        : 'border-sky-100 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                          isChairman ? 'bg-amber-500 text-white shadow-xs' :
                          isObserver ? 'bg-sky-600 text-white shadow-xs' :
                          isSecretary ? 'bg-indigo-600 text-white shadow-xs' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex flex-wrap items-center gap-1.5">
                            <span>{member.user.name}</span>
                            {isChairman && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.2 rounded-full border border-amber-200">
                                👑 ประธานกรรมการ
                              </span>
                            )}
                            {isObserver && (
                              <span className="text-[10px] bg-sky-100 text-blue-900 font-bold px-2 py-0.2 rounded-full border border-sky-200">
                                👁️ สังเกตการณ์ (Audit)
                              </span>
                            )}
                            {isSecretary && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.2 rounded-full border border-indigo-200">
                                ✍️ เลขานุการ
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {member.user.position} • {member.department}
                          </div>
                        </div>
                      </div>

                      {/* Vote Status Pill */}
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 ${
                        vote.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{vote.status === 'approved' ? 'อนุมัติ / เห็นชอบ' : 'มีข้อสังเกต'}</span>
                      </span>
                    </div>

                    {/* Member Review Comment Box */}
                    <div className="mt-3.5 bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 text-xs text-slate-700">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>ความเห็นและผลการตรวจรับ:</span>
                        <span className="text-blue-700 font-bold">คะแนน: {vote.score} / 100</span>
                      </div>
                      <p className="italic text-slate-800">
                        "{vote.comment}"
                      </p>
                    </div>

                    {/* Digital Signature & Timestamp */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1.5 text-blue-700 font-mono text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold">{member.user.name} [Digitally Signed]</span>
                      </div>
                      <div className="text-slate-400">
                        {vote.signedAt || '16 ก.ย. 2569'}
                      </div>
                    </div>

                    {/* Interactive Action for Demo / Testing */}
                    <div className="mt-3 flex items-center justify-end space-x-2 pt-2 border-t border-slate-100/80">
                      <button
                        onClick={() => handleMemberVote(member.userId, 'approved')}
                        className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold transition"
                      >
                        ✓ ลงมติเห็นชอบ
                      </button>
                      <button
                        onClick={() => handleMemberVote(member.userId, 'noted')}
                        className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold transition"
                      >
                        ✎ มีข้อสังเกต
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: INFO & COMMITTEES */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Project Info & Committee Composition */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Details Box */}
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-sky-100 shadow-xs space-y-4">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-sky-100 pb-3">
                <Building className="w-4 h-4 text-blue-600" />
                <span>ข้อมูลโครงการและงบประมาณ (PM-01 Compliance)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">หน่วยงานที่ขอจัดซื้อ:</span>
                  <span className="text-slate-800 font-bold text-sm">{request.requestingDepartment}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">ผู้ขอเสนอแต่งตั้ง:</span>
                  <span className="text-slate-800 font-bold text-sm">{request.requester.name} ({request.requester.position})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">วงเงินงบประมาณ:</span>
                  <span className="text-[#1e3a8a] font-black text-base">{formatCurrency(request.budget)}</span>
                  <span className="text-[11px] text-slate-500 block">({thaiBahtText(request.budget)})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">หมวดหมู่งาน:</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.badgeBorder}`}>
                      {catMeta.labelTh}
                    </span>
                    <span className="text-slate-500 text-[11px]">({catMeta.groupTh})</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-sky-100 space-y-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">วัตถุประสงค์และความจำเป็น:</span>
                  <p className="text-xs text-slate-700 leading-relaxed mt-0.5 bg-sky-50/40 p-3 rounded-xl border border-sky-100">
                    {request.objective}
                  </p>
                </div>
                {request.projectScope && (
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">ขอบเขตของโครงการ (Project Scope):</span>
                    <p className="text-xs text-slate-700 leading-relaxed mt-0.5 bg-sky-50/40 p-3 rounded-xl border border-sky-100">
                      {request.projectScope}
                    </p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              <div className="pt-2 border-t border-sky-100">
                <span className="text-xs text-slate-400 font-medium block mb-2">เอกสารแนบประกอบการพิจารณา:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {request.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 bg-sky-50/40 border border-sky-200/60 rounded-xl text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-400">{file.category} • {file.size}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        แนบแล้ว
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Committee Composition Table with Exception Highlighting */}
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-sky-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>รายชื่อคณะกรรมการคัดเลือกและตรวจรับงาน ({request.committeeMembers.length} ท่าน)</span>
                </h2>
                <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                  ครบตามเกณฑ์ PM-01
                </div>
              </div>

              <div className="divide-y divide-sky-100">
                {request.committeeMembers.map((member, idx) => {
                  const roleLabel = getRoleLabelThai(member.role);
                  return (
                    <div key={member.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start space-x-3">
                        <span className="w-6 h-6 rounded-full bg-sky-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                            <span>{member.user.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-normal">
                              {member.user.position}
                            </span>
                            {member.role === 'chairman' && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.2 rounded-full border border-amber-200">
                                👑 ประธานกรรมการ
                              </span>
                            )}
                            {member.role === 'observer' && (
                              <span className="text-[10px] bg-sky-100 text-blue-900 font-bold px-2 py-0.2 rounded-full border border-sky-200">
                                👁️ สังเกตการณ์ (Audit)
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            สังกัด: {member.department}
                          </div>

                          {/* Dynamic Logic Delegation Banner */}
                          {member.isDelegated && (
                            <div className="mt-2 bg-purple-50 border border-purple-200 rounded-xl p-2.5 text-purple-900 text-[11px] flex items-start space-x-2">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                              <div>
                                <strong>Dynamic Exception Logic:</strong> {member.delegationReason}
                                {member.delegatedToUser && (
                                  <div className="font-bold text-purple-800 mt-0.5">
                                    ผู้ปฏิบัติหน้าที่แทน: {member.delegatedToUser.name} ({member.delegatedToUser.position})
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        <span className="px-2.5 py-1 bg-sky-50 text-blue-800 rounded-lg font-semibold text-[11px] border border-sky-200/70">
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Workflow Timeline */}
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-sky-100 shadow-xs space-y-4">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-sky-100 pb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>ลำดับขั้นการอนุมัติ (Authority Matrix)</span>
              </h2>

              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-100">
                {request.approvalWorkflow.map((step, idx) => {
                  const isDone = step.status === 'approved';
                  const isCurrent = step.status === 'pending';
                  const isRejected = step.status === 'rejected';

                  let iconNode = <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 text-xs font-bold">{step.stepNumber}</div>;
                  if (isDone) {
                    iconNode = <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-xs"><Check className="w-4 h-4" /></div>;
                  } else if (isCurrent) {
                    iconNode = <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white animate-pulse shadow-xs"><Clock className="w-4 h-4" /></div>;
                  } else if (isRejected) {
                    iconNode = <div className="w-7 h-7 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white shadow-xs"><X className="w-4 h-4" /></div>;
                  }

                  return (
                    <div key={idx} className="relative pl-9 text-xs">
                      <div className="absolute left-0 top-0">{iconNode}</div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{step.roleTitle}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                            isDone ? 'bg-emerald-100 text-emerald-800' :
                            isCurrent ? 'bg-amber-100 text-amber-800' :
                            isRejected ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isDone ? 'อนุมัติแล้ว' : isCurrent ? 'รอพิจารณา' : isRejected ? 'ไม่อนุมัติ' : 'รอดำเนินการ'}
                          </span>
                        </div>

                        <div className="text-slate-700 font-medium">
                          {step.assignedApprover.name} ({step.assignedApprover.position})
                        </div>

                        {step.actionDate && (
                          <div className="text-[11px] text-slate-400">
                            วันที่ลงนาม: {step.actionDate}
                          </div>
                        )}

                        {step.comments && (
                          <div className="mt-1 bg-sky-50/60 border border-sky-100 rounded-lg p-2 text-slate-700 text-[11px] italic">
                            "{step.comments}"
                          </div>
                        )}

                        {step.signatureData && (
                          <div className="mt-1 inline-flex items-center space-x-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200 font-mono">
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            <span>{step.signatureData}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Document Verification Box */}
            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] p-5 rounded-2xl text-white shadow-md shadow-blue-900/10 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-200">
                <QrCode className="w-4 h-4 text-sky-300" />
                <span>Digital E-Document Integrity Check</span>
              </div>
              <p className="text-xs text-sky-100/90 leading-relaxed font-light">
                เอกสารนี้ได้รับการลงทะเบียนในระบบ Somboon Procurement e-Memo ป้องกันการปลอมแปลงและตรวจสอบความถูกต้องได้ทุกขั้นตอน
              </p>
              <button
                onClick={() => setActiveTab('memo')}
                className="w-full bg-white hover:bg-sky-50 text-[#1e3a8a] font-bold py-2.5 rounded-xl text-xs transition shadow-xs"
              >
                พิมพ์บันทึกข้อความภายในฉบับจริง (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKFLOW FOCUS */}
      {activeTab === 'workflow' && (
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-sky-100 shadow-xs space-y-6">
          <div className="border-b border-sky-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">แผนผังและสถานะการลงนามอนุมัติแบบดิจิทัล (Sequential Workflow)</h2>
            <p className="text-xs text-slate-500 mt-1">
              ระบบตรวจสอบอำนาจดำเนินการ (Authority Matrix) อัตโนมัติและส่งต่อให้อนุมัติทีละลำดับชั้น
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {request.approvalWorkflow.map((step, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  step.status === 'approved' ? 'bg-emerald-50/50 border-emerald-200' :
                  step.status === 'pending' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100' :
                  step.status === 'rejected' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-400">ขั้นที่ {step.stepNumber}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      step.status === 'approved' ? 'bg-emerald-600 text-white' :
                      step.status === 'pending' ? 'bg-amber-500 text-white' :
                      step.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {step.status === 'approved' ? 'อนุมัติเรียบร้อย' :
                       step.status === 'pending' ? 'รอการพิจารณา' :
                       step.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอลำดับก่อนหน้า'}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900">{step.roleTitle}</h3>
                  <div className="text-xs text-slate-800 mt-1 font-semibold">{step.assignedApprover.name}</div>
                  <div className="text-[11px] text-slate-500">{step.assignedApprover.position}</div>

                  {step.actionDate && (
                    <div className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      ลงนามเมื่อ: {step.actionDate}
                    </div>
                  )}

                  {step.comments && (
                    <div className="mt-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                      ความเห็น: "{step.comments}"
                    </div>
                  )}
                </div>

                {step.signatureData && (
                  <div className="mt-4 pt-2 border-t border-slate-200 flex items-center space-x-1 text-[10px] text-blue-700 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">{step.signatureData}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL MEMO PDF */}
      {activeTab === 'memo' && (
        <InternalMemoDocument request={request} />
      )}
    </div>
  );
};

