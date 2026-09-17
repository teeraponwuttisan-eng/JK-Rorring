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
  UserPlus,
  Layers,
  Scale,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { ProcurementRequest, UserProfile, CommitteeMemberEntry, CommitteeRole, AttachmentFile, AuthorityRule } from '../types/procurement';
import { mockUsers, mockAuthorityRules } from '../data/mockData';
import { PROJECT_CATEGORIES } from '../data/categories';
import { formatCurrency, thaiBahtText } from '../utils/formatters';
import { SomboonLogo } from './SomboonLogo';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmit: (newRequest: ProcurementRequest) => void;
  rules?: AuthorityRule[];
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  rules = mockAuthorityRules,
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

  // Authority Tier Selection Mode: 'auto' or specific rule id
  const [selectedTierId, setSelectedTierId] = useState<string>('auto');

  // Auto-calculated rule from budget
  const autoMatchedRule = rules.find(r => {
    if (r.maxBudget === null) {
      return budget >= r.minBudget;
    }
    return budget >= r.minBudget && budget <= r.maxBudget;
  }) || rules[0] || mockAuthorityRules[0];

  // Active target rule (user-selected or auto-calculated)
  const targetRule = selectedTierId === 'auto'
    ? autoMatchedRule
    : (rules.find(r => r.id === selectedTierId) || autoMatchedRule);

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

  const totalManagersCount = 1 + selectedMemberIds.length; // chairman + members
  const minRequiredManagers = targetRule?.minCommitteeMembers || 5;
  const isCommitteeValid = totalManagersCount >= minRequiredManagers && (!targetRule?.mustIncludeAuditObserver || !!selectedObserverId) && !!selectedSecretaryId;

  const handleSelectTier = (tierId: string) => {
    setSelectedTierId(tierId);
    if (tierId !== 'auto') {
      const selected = rules.find(r => r.id === tierId);
      if (selected) {
        // If current budget does not fall within the selected tier, adapt budget to tier's typical range
        if (selected.maxBudget !== null) {
          if (budget < selected.minBudget || budget > selected.maxBudget) {
            setBudget(Math.round((selected.minBudget + selected.maxBudget) / 2));
          }
        } else {
          if (budget < selected.minBudget) {
            setBudget(selected.minBudget + 5000000);
          }
        }
      }
    }
  };

  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
    // If auto mode is on, it will automatically compute targetRule
  };

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
      alert(`ระเบียบ PM-01 กำหนดให้มีคณะกรรมการอย่างน้อย ${minRequiredManagers} ท่าน และกรรมการสังเกตการณ์ (IA)`);
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

    // Build Workflow steps from targetRule
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
          
          {/* Box: เลือกประเภท โครงสร้างผังอำนาจดำเนินการตามระเบียบ PM-01 */}
          <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/80 border-2 border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/70 pb-3 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e3a8a] flex items-center gap-1.5">
                    <span>โครงสร้างผังอำนาจดำเนินการตามระเบียบ PM-01</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                      {selectedTierId === 'auto' ? 'ระบบตรวจจับอัตโนมัติ' : 'กำหนดประเภทแบบเฉพาะ'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    เลือกประเภทผังอำนาจตามวงเงินเพื่อกำหนดเกณฑ์กรรมการ ผู้อนุมัติแต่งตั้ง และผู้ชี้ขาดตามคู่มือ PM-01
                  </p>
                </div>
              </div>

              {/* Quick auto toggle */}
              {selectedTierId !== 'auto' && (
                <button
                  type="button"
                  onClick={() => setSelectedTierId('auto')}
                  className="text-xs bg-white text-blue-700 hover:bg-blue-50 border border-blue-300 font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shrink-0 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>คืนค่าตรวจจับตามวงเงินอัตโนมัติ</span>
                </button>
              )}
            </div>

            {/* Dropdown Selector Box */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-blue-950 mb-1.5">
                  เลือกประเภท โครงสร้างผังอำนาจดำเนินการ (Authority Matrix Tier) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => handleSelectTier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-blue-300 rounded-xl text-xs sm:text-sm font-bold text-[#1e3a8a] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
                >
                  <option value="auto">
                    ✨ ตรวจจับอัตโนมัติตามวงเงินงบประมาณ (ปัจจุบันตรงกับ: {autoMatchedRule.budgetLabel || autoMatchedRule.tierName})
                  </option>
                  {rules.map((r, idx) => (
                    <option key={r.id} value={r.id}>
                      {idx + 1}. วงเงิน {r.budgetLabel || r.tierName} ➔ {r.committeeDescription} (ผู้อนุมัติ: {r.appointmentApprover})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visual Tier Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1">
                {rules.map((r) => {
                  const isActive = targetRule.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectTier(r.id)}
                      className={`text-left p-2 rounded-xl border text-[11px] transition flex flex-col justify-between ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-bold'
                          : 'bg-white/90 hover:bg-white text-slate-700 border-blue-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {r.budgetLabel || r.tierName}
                        </span>
                        {isActive && <CheckCircle2 className="w-3 h-3 text-sky-200" />}
                      </div>
                      <div className={`mt-1 line-clamp-1 ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                        {r.committeeDescription}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Matrix Summary Card */}
              <div className="bg-white rounded-xl border border-blue-200/90 p-3.5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center space-x-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span>เกณฑ์กรรมการ (PM-01)</span>
                  </div>
                  <div className="text-xs font-bold text-[#1e3a8a] mt-0.5">
                    {targetRule.committeeDescription}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ระดับที่ต้องแต่งตั้ง: <strong className="text-slate-700">{targetRule.committeeLevelRequired || 'Manager'}</strong> (ขั้นต่ำ {targetRule.minCommitteeMembers} ท่าน)
                  </div>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>ผู้อนุมัติ การแต่งตั้งคณะกรรมการ</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-900 mt-0.5">
                    {targetRule.appointmentApprover}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ผู้ลงนามคำสั่งแต่งตั้งเป็นทางการ
                  </div>
                </div>

                <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase flex items-center space-x-1">
                    <Scale className="w-3 h-3 text-purple-600" />
                    <span>ผู้อนุมัติ ชี้ขาดกรณีไม่เป็นเอกฉันท์</span>
                  </div>
                  <div className="text-xs font-bold text-purple-900 mt-0.5">
                    {targetRule.disputeResolutionApprover}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ผู้มีอำนาจวินิจฉัยและชี้ขาดตามระเบียบ
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  หมวดหมู่โครงการ ({PROJECT_CATEGORIES.length} หมวดหมู่) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:border-blue-500 transition"
                >
                  {Array.from(new Set(PROJECT_CATEGORIES.map(c => c.groupTh))).map((group) => (
                    <optgroup key={group} label={group} className="font-bold text-slate-900">
                      {PROJECT_CATEGORIES.filter(c => c.groupTh === group).map((cat) => (
                        <option key={cat.id} value={cat.id} className="font-normal text-slate-700">
                          {cat.labelTh} ({cat.labelEn})
                        </option>
                      ))}
                    </optgroup>
                  ))}
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
                    onChange={(e) => handleBudgetChange(Number(e.target.value))}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-sky-100 pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>2. รายชื่อคณะกรรมการคัดเลือกและตรวจรับงาน ({targetRule.committeeLevelRequired || 'Manager'} {minRequiredManagers} ท่านขึ้นไป)</span>
              </h3>
              <div className="text-xs">
                จำนวนกรรมการหลัก: <strong className={totalManagersCount >= minRequiredManagers ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {totalManagersCount} ท่าน
                </strong> (เกณฑ์ขั้นต่ำตาม PM-01: {minRequiredManagers} ท่าน)
              </div>
            </div>

            {/* 1. Chairman */}
            <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                👑 ประธานกรรมการ (Chairman - ระดับ {targetRule.committeeLevelRequired || 'Manager'} ขึ้นไป):
              </label>
              <select
                value={selectedChairmanId}
                onChange={(e) => setSelectedChairmanId(e.target.value)}
                className="w-full bg-white border border-sky-200/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {mockUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.position} ({u.department}) [{u.level}]
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
