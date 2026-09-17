import React, { useState } from 'react';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  FileUp, 
  Building, 
  DollarSign, 
  Calendar, 
  Plus, 
  Trash2, 
  HelpCircle,
  CheckCircle2,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { ProcurementRequest, UserProfile, CommitteeMemberEntry, CommitteeRole, AttachmentFile } from '../types/procurement';
import { mockUsers, mockAuthorityRules } from '../data/mockData';
import { formatCurrency, thaiBahtText } from '../utils/formatters';
import { SomboonLogo } from './SomboonLogo';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmit: (newRequest: ProcurementRequest) => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  if (!isOpen) return null;

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(currentUser.department || 'Purchasing & Sourcing');
  const [budget, setBudget] = useState<number>(3500000);
  const [objective, setObjective] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [category, setCategory] = useState<ProcurementRequest['category']>('Engineering & Machinery');
  const [urgentLevel, setUrgentLevel] = useState<ProcurementRequest['urgentLevel']>('normal');
  const [targetStartDate, setTargetStartDate] = useState('2026-10-01');
  const [targetCompletionDate, setTargetCompletionDate] = useState('2027-03-31');

  // Committee selection state
  const [selectedChairmanId, setSelectedChairmanId] = useState<string>('usr-005'); // Kittisak
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(['usr-006', 'usr-007', 'usr-009', 'usr-001']);
  const [selectedObserverId, setSelectedObserverId] = useState<string>('usr-008'); // IA Napaporn
  const [selectedSecretaryId, setSelectedSecretaryId] = useState<string>('usr-010'); // Preeyaporn

  // Attachments
  const [attachments, setAttachments] = useState<AttachmentFile[]>([
    { id: 'att-mock-1', name: 'TOR_Draft_Project_Specification_v1.pdf', size: '2.8 MB', uploadDate: '2026-09-16', category: 'TOR' },
    { id: 'att-mock-2', name: 'Budget_Approval_Board_Extract.pdf', size: '1.1 MB', uploadDate: '2026-09-16', category: 'Budget_Approval' }
  ]);

  // Validation
  const isBudgetUnder1M = budget < 1000000;
  const isBudgetHighValue = budget > 10000000;
  const totalManagersCount = 1 + selectedMemberIds.length; // chairman + members
  const isCommitteeValid = totalManagersCount >= 5 && !!selectedObserverId && !!selectedSecretaryId;

  // Generate Workflow based on budget
  const targetRule = isBudgetHighValue ? mockAuthorityRules[1] : mockAuthorityRules[0];

  const handleAddMember = (userId: string) => {
    if (!selectedMemberIds.includes(userId) && userId !== selectedChairmanId && userId !== selectedObserverId) {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !objective || budget <= 0) {
      alert('กรุณากรอกข้อมูลโครงการให้ครบถ้วน');
      return;
    }

    if (!isCommitteeValid) {
      alert('ระเบียบ PM-01 กำหนดให้มีคณะกรรมการระดับ Manager อย่างน้อย 5-6 ท่าน และกรรมการสังเกตการณ์ (IA)');
      return;
    }

    const docSeq = Math.floor(Math.random() * 90) + 50;
    const documentNo = `SB-MEMO-2026-00${docSeq}`;

    // Build committee member list
    const committeeEntries: CommitteeMemberEntry[] = [];

    // 1. Chairman
    const chairmanUser = mockUsers.find(u => u.id === selectedChairmanId)!;
    committeeEntries.push({
      id: `cm-ch-${Date.now()}`,
      userId: chairmanUser.id,
      user: chairmanUser,
      role: 'chairman',
      department: chairmanUser.department,
    });

    // 2. Members
    selectedMemberIds.forEach((mId, idx) => {
      const user = mockUsers.find(u => u.id === mId)!;
      const isVacantOrLeave = user.status === 'on_leave' || user.status === 'transferred';
      const delegatedUser = isVacantOrLeave && user.successorId 
        ? mockUsers.find(u => u.id === user.successorId)
        : undefined;

      committeeEntries.push({
        id: `cm-m-${idx}-${Date.now()}`,
        userId: user.id,
        user: user,
        role: 'member',
        department: user.department,
        isDelegated: isVacantOrLeave,
        delegatedToUser: delegatedUser,
        delegationReason: isVacantOrLeave 
          ? `ระบบโอนสิทธิ์ให้ ${delegatedUser?.name || 'ผู้บังคับบัญชา'} ตาม Exception Rule PM-01`
          : undefined,
      });
    });

    // 3. Observer (IA)
    const observerUser = mockUsers.find(u => u.id === selectedObserverId)!;
    committeeEntries.push({
      id: `cm-obs-${Date.now()}`,
      userId: observerUser.id,
      user: observerUser,
      role: 'observer',
      department: observerUser.department,
    });

    // 4. Secretary
    const secUser = mockUsers.find(u => u.id === selectedSecretaryId)!;
    committeeEntries.push({
      id: `cm-sec-${Date.now()}`,
      userId: secUser.id,
      user: secUser,
      role: 'secretary',
      department: secUser.department,
    });

    // Build Workflow steps
    const workflow = targetRule.requiredSteps.map(step => {
      let approver = mockUsers[0]; // Default requester
      if (step.stepNumber === 2) approver = mockUsers[1]; // AGM Jaturong
      if (step.stepNumber === 3) approver = mockUsers[2]; // VP Patpong
      if (step.stepNumber === 4) approver = mockUsers[3]; // President Wichai

      return {
        stepNumber: step.stepNumber,
        roleTitle: step.title,
        assignedApproverId: approver.id,
        assignedApprover: approver,
        status: (step.stepNumber === 1 ? 'approved' : (step.stepNumber === 2 ? 'pending' : 'waiting')) as any,
        actionDate: step.stepNumber === 1 ? '2026-09-16 10:00:00' : undefined,
        signatureData: step.stepNumber === 1 ? `${currentUser.name} [Digitally Signed]` : undefined,
        comments: step.stepNumber === 1 ? 'ผู้ขอเสนอแต่งตั้ง ตรวจสอบความถูกต้องและส่งเข้าสายอนุมัติ' : undefined,
      };
    });

    const newReq: ProcurementRequest = {
      id: `req-${Date.now()}`,
      documentNo,
      title,
      requestingDepartment: department,
      requesterId: currentUser.id,
      requester: currentUser,
      budget,
      objective,
      projectScope: projectScope || objective,
      category,
      targetStartDate,
      targetCompletionDate,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internalMemoDate: '16 กันยายน 2569',
      urgentLevel,
      attachments,
      committeeMembers: committeeEntries,
      approvalWorkflow: workflow,
      currentStepIndex: 1, // Step 2 (AGM) is next
    };

    onSubmit(newReq);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] px-6 py-4 flex items-center justify-between text-white border-b border-blue-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center p-1.5 border border-white/20">
              <SomboonLogo variant="icon-only" size="sm" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-white/20 text-sky-100 px-2.5 py-0.5 rounded-full font-semibold">
                  บันทึกข้อความขออนุมัติ
                </span>
                <span className="text-xs text-sky-200">ระเบียบจัดซื้อจัดจ้าง PM-01</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                สร้างคำขอแต่งตั้งคณะกรรมการคัดเลือกและตรวจรับงานโครงการ
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-800">
          
          {/* PM-01 Rule Alert */}
          {isBudgetUnder1M ? (
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 flex items-start space-x-3 text-amber-950 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm">ข้อสังเกตระเบียบ PM-01:</strong>
                วงเงินที่ระบุต่ำกว่า 1,000,000 บาท ตามระเบียบ PM-01 ไม่จำเป็นต้องแต่งตั้งคณะกรรมการ 5 ท่าน สามารถจัดซื้อตามกระบวนการปกติได้ (หากต้องการแต่งตั้งตามความสำคัญของโครงการ สามารถดำเนินการต่อได้)
              </div>
            </div>
          ) : (
            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 flex items-start space-x-3 text-blue-950 text-xs">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-sm">เข้าเกณฑ์ระเบียบ PM-01 (วงเงินเกิน 1,000,000 บาท):</strong>
                ระบบเปิดใช้งานการเลือกคณะกรรมการระดับ Manager อย่างน้อย 5-6 ท่าน พร้อมกำหนดเส้นทางอนุมัติแบบ Digital Approval Loop ถึงระดับ AGM & VP อัตโนมัติ
              </div>
            </div>
          )}

          {/* Section 1: ข้อมูลโครงการและงบประมาณ */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-sky-100 pb-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>1. ข้อมูลโครงการและวงเงินงบประมาณ</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อโครงการ / เรื่องขออนุมัติ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ขออนุมัติแต่งตั้งคณะกรรมการจัดซื้อจัดจ้างโครงการ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หน่วยงานที่ขอสั่งซื้อ / ฝ่ายงาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมวดหมู่โครงการ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition"
                >
                  <option value="Engineering & Machinery">Engineering & Machinery (เครื่องจักรและวิศวกรรม)</option>
                  <option value="Energy & Utilities">Energy & Utilities (พลังงานและสาธารณูปโภค)</option>
                  <option value="Supply Chain Logistics">Supply Chain Logistics (คลังและโลจิสติกส์)</option>
                  <option value="Factory Expansion">Factory Expansion (ปรับปรุงขยายโรงงาน)</option>
                  <option value="IT & Digital Infrastructure">IT & Digital Infrastructure (ระบบไอทีองค์กร)</option>
                </select>
              </div>

              {/* Budget Input & Baht Text Converter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วงเงินงบประมาณโครงการ (บาท) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={100000}
                    step={50000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm font-bold text-[#1e3a8a] focus:bg-white focus:border-blue-500 transition"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  {formatCurrency(budget)} ({thaiBahtText(budget)})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระดับความเร่งด่วน
                </label>
                <select
                  value={urgentLevel}
                  onChange={(e) => setUrgentLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm text-slate-900 focus:bg-white transition"
                >
                  <option value="normal">ปกติ (Normal - 3 วันทำการ)</option>
                  <option value="urgent">ด่วน (Urgent - 24 ชั่วโมง)</option>
                  <option value="very_urgent">ด่วนที่สุด (Immediate Executive Review)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วัตถุประสงค์และความจำเป็นของโครงการ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="ระบุเหตุผลความจำเป็นในการสั่งซื้อ/จัดจ้างโครงการนี้ตามมาตรฐาน PM-01..."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: คณะกรรมการคัดเลือกและตรวจรับงาน (PM-01 Requirement) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>2. รายชื่อคณะกรรมการคัดเลือกและตรวจรับงาน (Manager 5-6 ท่าน)</span>
              </h3>
              <div className="text-xs">
                จำนวนกรรมการหลัก: <strong className={totalManagersCount >= 5 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {totalManagersCount} ท่าน
                </strong> (เกณฑ์ขั้นต่ำ 5 ท่าน)
              </div>
            </div>

            {/* 1. Chairman */}
            <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                👑 ประธานกรรมการ (Chairman - ผู้จัดการฝ่าย/โรงงาน):
              </label>
              <select
                value={selectedChairmanId}
                onChange={(e) => setSelectedChairmanId(e.target.value)}
                className="w-full bg-white border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {mockUsers.filter(u => u.level === 'Manager').map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.position} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Committee Members (Managers) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  👥 กรรมการคัดเลือกและตรวจรับงาน (Committee Members):
                </label>
                <div className="text-[11px] text-slate-500 font-medium">เลือกจากผู้จัดการฝ่ายที่เกี่ยวข้อง</div>
              </div>

              <div className="space-y-2">
                {selectedMemberIds.map((mId, idx) => {
                  const user = mockUsers.find(u => u.id === mId);
                  if (!user) return null;
                  const isException = user.status === 'on_leave' || user.status === 'transferred';
                  const successor = user.successorId ? mockUsers.find(u => u.id === user.successorId) : null;

                  return (
                    <div
                      key={mId}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition ${
                        isException ? 'bg-purple-50/80 border-purple-200' : 'bg-white border-sky-100 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-sky-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{user.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded-md font-normal">
                              {user.position}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">{user.department}</div>

                          {/* Dynamic Logic Indicator */}
                          {isException && (
                            <div className="mt-1 text-[11px] text-purple-800 bg-purple-100/70 px-2.5 py-1 rounded-lg flex items-center space-x-1 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>
                                <strong>Dynamic Rule:</strong> {user.name} ({user.status === 'on_leave' ? 'ลาพักผ่อน' : 'โยกย้าย'}) 
                                ➔ ระบบโอนสิทธิ์ให้ <strong>{successor?.name || 'รักษาการแทน'}</strong> อัตโนมัติ
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(mId)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Member Selector */}
              <div className="flex items-center space-x-2 pt-2">
                <select
                  id="select-add-committee-member"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddMember(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 bg-sky-50/40 border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white transition"
                >
                  <option value="">+ เลือกเพิ่มกรรมการระดับ Manager เพิ่มเติม...</option>
                  {mockUsers
                    .filter(u => u.level === 'Manager' && !selectedMemberIds.includes(u.id) && u.id !== selectedChairmanId)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.position} {u.status === 'on_leave' ? '(⚠️ มี Acting Proxy)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* 3. Observer (IA) & Secretary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  👁️ กรรมการสังเกตการณ์ (Observer - Internal Audit):
                </label>
                <select
                  value={selectedObserverId}
                  onChange={(e) => setSelectedObserverId(e.target.value)}
                  className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                >
                  {mockUsers.filter(u => u.department.includes('Audit') || u.department.includes('Governance')).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                  ))}
                </select>
              </div>

              <div className="bg-sky-50/40 p-3.5 rounded-2xl border border-sky-100">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ✍️ เลขานุการคณะกรรมการ (Secretary):
                </label>
                <select
                  value={selectedSecretaryId}
                  onChange={(e) => setSelectedSecretaryId(e.target.value)}
                  className="w-full bg-white border border-sky-200/80 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                >
                  {mockUsers.filter(u => u.department.includes('Purchasing')).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: เวิร์กโฟลว์การอนุมัติที่จะถูกสร้าง */}
          <div className="space-y-3 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>3. เส้นทางการอนุมัติตาม Authority Matrix ({targetRule.tierName})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {targetRule.requiredSteps.map((s, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-sky-100 shadow-xs">
                  <div className="text-[10px] text-blue-600 font-bold uppercase">ขั้นที่ {s.stepNumber}</div>
                  <div className="font-bold text-slate-900 mt-0.5">{s.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{s.defaultApproverPosition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-submit-new-request"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกและส่งเสนอขออนุมัติ (Submit Workflow)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
