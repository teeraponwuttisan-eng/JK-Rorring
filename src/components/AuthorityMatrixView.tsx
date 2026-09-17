import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Check, 
  Plus, 
  Trash2, 
  Info, 
  ArrowRight,
  Sparkles,
  Layers,
  Edit3,
  Save,
  RotateCcw,
  MoveUp,
  MoveDown,
  Calculator,
  PlusCircle,
  Copy,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  GitBranch,
  UserCheck,
  Scale,
  Award,
  Users
} from 'lucide-react';
import { AuthorityRule, UserProfile } from '../types/procurement';
import { formatCurrency } from '../utils/formatters';
import { mockAuthorityRules, mockUsers } from '../data/mockData';

interface AuthorityMatrixViewProps {
  rules: AuthorityRule[];
  onUpdateRules?: (newRules: AuthorityRule[]) => void;
  currentUser?: UserProfile;
  onLogAudit?: (action: string, details: string) => void;
}

export const AuthorityMatrixView: React.FC<AuthorityMatrixViewProps> = ({ 
  rules, 
  onUpdateRules,
  currentUser,
  onLogAudit
}) => {
  const [editingRules, setEditingRules] = useState<AuthorityRule[]>(() => JSON.parse(JSON.stringify(rules)));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(rules[0]?.id || null);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'diagram'>('table');

  // Simulation test state
  const [testBudget, setTestBudget] = useState<number>(3500000);

  // Sync state if external rules prop changes and not in edit mode
  React.useEffect(() => {
    if (!isEditMode) {
      setEditingRules(JSON.parse(JSON.stringify(rules)));
    }
  }, [rules, isEditMode]);

  const activeRulesList = isEditMode ? editingRules : rules;

  // Handle Save
  const handleSave = () => {
    if (onUpdateRules) {
      onUpdateRules(editingRules);
    }
    setIsEditMode(false);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 4000);

    if (onLogAudit) {
      onLogAudit(
        'UPDATE_AUTHORITY_MATRIX', 
        `ผู้ใช้งาน ${currentUser?.name || 'Administrator'} ได้ทำการปรับปรุงผังอำนาจดำเนินการ (Authority Matrix) จำนวน ${editingRules.length} ระดับ (Tiers)`
      );
    }
  };

  // Handle Reset to Default PM-01 (5-Tier Table from Image)
  const handleResetDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตผังอำนาจดำเนินการกลับเป็นค่ามาตรฐานระเบียบ PM-01 (5 ระดับตามตารางกำหนดอำนาจ) ใช่หรือไม่?')) {
      const defaultPreset = JSON.parse(JSON.stringify(mockAuthorityRules));
      setEditingRules(defaultPreset);
      if (onUpdateRules) {
        onUpdateRules(defaultPreset);
      }
      setIsEditMode(false);
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 4000);
    }
  };

  // Add a new Tier
  const handleAddNewTier = () => {
    const newTierNum = editingRules.length + 1;
    const newTier: AuthorityRule = {
      id: `rule-tier-${Date.now().toString().slice(-4)}`,
      tierName: `PM-01 Tier ${newTierNum}: โครงการกำหนดเอง`,
      budgetLabel: `>50 ล้านบาท`,
      minBudget: 50000001,
      maxBudget: null,
      committeeDescription: 'VP/MD level up(5) และเพิ่ม VP/MD level up(1) เพื่อตรวจรับ',
      committeeLevelRequired: 'VP/MD level up',
      minCommitteeMembers: 6,
      inspectorsCount: 1,
      appointmentApprover: 'กรรมการผู้อำนวยการ / คณะกรรมการบริษัท',
      appointmentApproverLevel: 'Board',
      disputeResolutionApprover: 'คณะกรรมการบริษัท (Board of Directors)',
      disputeResolutionApproverLevel: 'Board',
      mustIncludeAuditObserver: true,
      requiredSteps: [
        {
          stepNumber: 1,
          title: 'ผู้ขอเสนอแต่งตั้ง / Manager Purchasing',
          levelRequired: 'Manager',
          defaultApproverPosition: 'Manager - Strategic Purchasing',
        },
        {
          stepNumber: 2,
          title: 'ผู้ช่วยผู้จัดการทั่วไปฝ่ายห่วงโซ่อุปทาน และระบบ',
          levelRequired: 'AGM',
          defaultApproverPosition: 'AGM - Supply Chain Development',
        },
        {
          stepNumber: 3,
          title: 'รองกรรมการผู้อำนวยการฝ่ายห่วงโซ่อุปทาน และระบบ',
          levelRequired: 'VP',
          defaultApproverPosition: 'Vice President – Supply Chain',
        },
        {
          stepNumber: 4,
          title: 'กรรมการผู้อำนวยการ (ผู้อนุมัติแต่งตั้ง)',
          levelRequired: 'President',
          defaultApproverPosition: 'President & CEO',
        }
      ]
    };
    setEditingRules([...editingRules, newTier]);
    setIsEditMode(true);
    setSelectedTierId(newTier.id);
  };

  // Delete a Tier
  const handleDeleteTier = (tierId: string) => {
    if (editingRules.length <= 1) {
      alert('ระบบต้องมีผังอำนาจดำเนินการอย่างน้อย 1 ระดับ (Tier)');
      return;
    }
    if (window.confirm('คุณต้องการลบระดับอำนาจดำเนินการนี้ใช่หรือไม่?')) {
      const updated = editingRules.filter(r => r.id !== tierId);
      setEditingRules(updated);
      setSelectedTierId(updated[0]?.id || null);
    }
  };

  // Duplicate a Tier
  const handleDuplicateTier = (tier: AuthorityRule) => {
    const duplicated: AuthorityRule = {
      ...JSON.parse(JSON.stringify(tier)),
      id: `rule-tier-${Date.now().toString().slice(-4)}`,
      tierName: `${tier.tierName} (คัดลอก)`,
    };
    setEditingRules([...editingRules, duplicated]);
    setIsEditMode(true);
    setSelectedTierId(duplicated.id);
  };

  // Update Tier Field
  const handleUpdateTierField = (tierId: string, field: keyof AuthorityRule, value: any) => {
    setEditingRules(prev => prev.map(r => {
      if (r.id === tierId) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  // Step Management inside a Tier
  const handleAddStep = (tierId: string) => {
    setEditingRules(prev => prev.map(r => {
      if (r.id === tierId) {
        const nextStepNumber = r.requiredSteps.length + 1;
        const newStep = {
          stepNumber: nextStepNumber,
          title: `ขั้นตอนที่ ${nextStepNumber} (เช่น ผู้อำนวยการ / ผู้บริหารระดับสูง)`,
          levelRequired: 'VP',
          defaultApproverPosition: 'Executive Director / VP',
        };
        return {
          ...r,
          requiredSteps: [...r.requiredSteps, newStep]
        };
      }
      return r;
    }));
  };

  const handleDeleteStep = (tierId: string, stepNumber: number) => {
    setEditingRules(prev => prev.map(r => {
      if (r.id === tierId) {
        if (r.requiredSteps.length <= 1) {
          alert('ต้องมีขั้นตอนการอนุมัติอย่างน้อย 1 ขั้นตอน');
          return r;
        }
        const filtered = r.requiredSteps.filter(s => s.stepNumber !== stepNumber);
        const reindexed = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
        return {
          ...r,
          requiredSteps: reindexed
        };
      }
      return r;
    }));
  };

  const handleMoveStep = (tierId: string, stepIndex: number, direction: 'up' | 'down') => {
    setEditingRules(prev => prev.map(r => {
      if (r.id === tierId) {
        const steps = [...r.requiredSteps];
        const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
        if (targetIndex < 0 || targetIndex >= steps.length) return r;

        const temp = steps[stepIndex];
        steps[stepIndex] = steps[targetIndex];
        steps[targetIndex] = temp;

        const reindexed = steps.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
        return {
          ...r,
          requiredSteps: reindexed
        };
      }
      return r;
    }));
  };

  const handleUpdateStepField = (tierId: string, stepIndex: number, field: string, value: string) => {
    setEditingRules(prev => prev.map(r => {
      if (r.id === tierId) {
        const steps = [...r.requiredSteps];
        steps[stepIndex] = {
          ...steps[stepIndex],
          [field]: value
        };
        return {
          ...r,
          requiredSteps: steps
        };
      }
      return r;
    }));
  };

  // Find simulated rule for test budget
  const simulatedRule = activeRulesList.find(r => {
    if (r.maxBudget === null) {
      return testBudget >= r.minBudget;
    }
    return testBudget >= r.minBudget && testBudget <= r.maxBudget;
  }) || activeRulesList[activeRulesList.length - 1];

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Toast Notification when saved */}
      {isSavedAlert && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-400 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div>
            <div className="font-bold text-sm">บันทึกการปรับแต่งผังอำนาจเรียบร้อยแล้ว</div>
            <div className="text-xs text-emerald-100">ระบบอัปเดตกฎเกณฑ์และการคำนวณ Sequential Routing ทันที</div>
          </div>
        </div>
      )}

      {/* Header Info & Action Controls */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-sky-100 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
              <Sliders className="w-3.5 h-3.5" />
              <span>Somboon Advance Technology • PM-01 Official Matrix</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">ตารางอำนาจดำเนินการตามระเบียบบริษัท</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              ผังอำนาจดำเนินการ (Authority Matrix) ตามคู่มือจัดซื้อจัดจ้าง PM-01
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              ตารางกำหนดเกณฑ์คุณสมบัติคณะกรรมการ, ผู้อนุมัติแต่งตั้งคณะกรรมการ, และผู้อนุมัติชี้ขาดในกรณีความเห็นไม่เป็นเอกฉันท์ ตามระดับวงเงินการจัดซื้อ/จัดจ้าง
            </p>
          </div>

          {/* Action Buttons: View mode switcher & Edit / Save */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 text-xs font-bold">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                  viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>ตาราง PM-01</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                  viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>สายอนุมัติ (Detail)</span>
              </button>
            </div>

            {!isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center space-x-1.5 transition transform active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>ปรับแต่งผังอำนาจ (Adjust Rules)</span>
                </button>

                <button
                  onClick={handleAddNewTier}
                  className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-blue-700 border border-sky-200/80 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มระดับใหม่</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนแปลง (Save Matrix)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingRules(JSON.parse(JSON.stringify(rules)));
                    setIsEditMode(false);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  ยกเลิก
                </button>
              </>
            )}

            <button
              onClick={handleResetDefault}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              title="รีเซ็ตกลับเป็นค่าเริ่มต้นตามตาราง 5 ระดับ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>รีเซ็ตตามคู่มือ</span>
            </button>
          </div>
        </div>

        {/* Edit Mode Alert Banner */}
        {isEditMode && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold">กำลังอยู่ในโหมดแก้ไขผังอำนาจดำเนินการ (Editing Mode):</strong>
                <span className="block text-amber-800 text-[11px] mt-0.5">
                  ท่านสามารถปรับแก้วงเงิน, เกณฑ์กรรมการ, ผู้มีอำนาจอนุมัติแต่งตั้ง และผู้ชี้ขาดกรณีไม่เป็นเอกฉันท์ได้โดยตรง
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleAddNewTier}
                className="px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มแถววงเงินใหม่</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Calculator Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-[#1e3a8a] text-white p-5 sm:p-6 rounded-3xl shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-sky-200 font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>เครื่องมือจำลองคำนวณสายอนุมัติอัตโนมัติ (Live Matrix Simulator)</span>
            </div>
            <p className="text-xs text-sky-100/80">
              ทดสอบกรอกวงเงินจัดซื้อจัดจ้าง เพื่อตรวจสอบเกณฑ์กรรมการ ผู้อนุมัติแต่งตั้ง และผู้ชี้ขาดตามผังอำนาจ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <label className="text-xs text-sky-200 font-medium">ทดสอบวงเงิน:</label>
            <div className="relative">
              <input
                type="number"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value) || 0)}
                className="w-44 px-3 py-1.5 bg-white text-slate-900 font-black text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                step="500000"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium pointer-events-none">บาท</span>
            </div>

            <div className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-semibold flex items-center space-x-1.5">
              <span>ผลการจับคู่:</span>
              <strong className="text-white underline">{simulatedRule?.budgetLabel || simulatedRule?.tierName}</strong>
            </div>
          </div>
        </div>

        {/* Live Simulator Match Highlight Card */}
        {simulatedRule && (
          <div className="mt-4 pt-4 border-t border-blue-700/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-sky-300 font-bold block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                เกณฑ์คณะกรรมการ:
              </span>
              <div className="text-white font-semibold text-xs leading-relaxed">
                {simulatedRule.committeeDescription}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-sky-300 font-bold block mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                ผู้อนุมัติ การแต่งตั้งคณะกรรมการ:
              </span>
              <div className="text-white font-bold text-xs">
                {simulatedRule.appointmentApprover}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-sky-300 font-bold block mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-rose-300" />
                ผู้อนุมัติ ชี้ขาดกรณีไม่เป็นเอกฉันท์:
              </span>
              <div className="text-white font-bold text-xs">
                {simulatedRule.disputeResolutionApprover}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: OFFICIAL TABLE VIEW (Exact layout matching the User's Image) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-sky-50/70 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs text-blue-900 font-bold">
              <TableIcon className="w-4 h-4 text-blue-600" />
              <span>ตารางผังอำนาจดำเนินการตามระเบียบจัดซื้อจัดจ้าง PM-01 (Somboon Advance Technology)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              * ข้อมูลอิงตามภาพ Logic ของระเบียบอำนาจดำเนินการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Header Styled matching the light-blue table style in the image */}
              <thead>
                <tr className="bg-[#cfe2f3] text-slate-900 text-xs font-black divide-x divide-slate-300 border-b-2 border-slate-300">
                  <th className="py-3.5 px-4 text-center w-[22%]">
                    <div>วงเงิน</div>
                    <div className="font-bold text-[11px] text-slate-700">(การจัดซื้อ/จัดจ้าง)</div>
                  </th>
                  <th className="py-3.5 px-4 text-center w-[30%]">
                    กรรมการ
                  </th>
                  <th className="py-3.5 px-4 text-center w-[25%]">
                    ผู้อนุมัติ<br />การแต่งตั้งคณะกรรมการ
                  </th>
                  <th className="py-3.5 px-4 text-center w-[23%]">
                    ผู้อนุมัติ<br />ชี้ขาดในกรณีความเห็นไม่เป็นเอกฉันท์
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-300 text-xs text-slate-800 font-medium">
                {activeRulesList.map((rule, idx) => {
                  const isSimulatedMatch = simulatedRule?.id === rule.id;
                  
                  // For the dispute resolution approver column:
                  // Row 1 (>5แสน ; <1ล้าน) has its own dispute approver (VP)
                  // Rows 2, 3, 4, 5 share "กรรมการผู้อำนวยการ"
                  const isFirstOfPresidentGroup = idx === 1;
                  const isInPresidentGroup = idx >= 1 && idx <= 4;

                  return (
                    <tr 
                      key={rule.id}
                      className={`divide-x divide-slate-300 transition-colors ${
                        isSimulatedMatch 
                          ? 'bg-amber-50/90 font-semibold ring-2 ring-inset ring-amber-400' 
                          : idx % 2 === 0 ? 'bg-white hover:bg-sky-50/40' : 'bg-slate-50/60 hover:bg-sky-50/40'
                      }`}
                    >
                      {/* Column 1: วงเงิน */}
                      <td className="py-3.5 px-4 align-middle">
                        {!isEditMode ? (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">
                              {rule.budgetLabel || `${formatCurrency(rule.minBudget)} - ${rule.maxBudget ? formatCurrency(rule.maxBudget) : 'ขึ้นไป'}`}
                            </span>
                            {isSimulatedMatch && (
                              <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-extrabold rounded-md shadow-xs">
                                ตรงกับวงเงินทดสอบ
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={rule.budgetLabel || ''}
                              onChange={(e) => handleUpdateTierField(rule.id, 'budgetLabel', e.target.value)}
                              placeholder="เช่น >1-10 ล้านบาท"
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                            />
                            <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                              <span>Min:</span>
                              <input
                                type="number"
                                value={rule.minBudget}
                                onChange={(e) => handleUpdateTierField(rule.id, 'minBudget', parseFloat(e.target.value) || 0)}
                                className="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded"
                              />
                              <span>Max:</span>
                              <input
                                type="number"
                                placeholder="null"
                                value={rule.maxBudget ?? ''}
                                onChange={(e) => handleUpdateTierField(rule.id, 'maxBudget', e.target.value === '' ? null : parseFloat(e.target.value))}
                                className="w-20 px-1 py-0.5 bg-white border border-slate-200 rounded"
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Column 2: กรรมการ */}
                      <td className="py-3.5 px-4 align-middle">
                        {!isEditMode ? (
                          <div className="text-slate-900">
                            {rule.committeeDescription || `${rule.committeeLevelRequired || 'Manager'} (${rule.minCommitteeMembers - 1}) และเพิ่ม (${rule.inspectorsCount || 1}) เพื่อตรวจรับ`}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={rule.committeeDescription || ''}
                              onChange={(e) => handleUpdateTierField(rule.id, 'committeeDescription', e.target.value)}
                              placeholder="เช่น Manager(5) และเพิ่ม Manager(1) เพื่อตรวจรับ"
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                            />
                            <div className="flex items-center space-x-2 text-[11px] text-slate-600">
                              <span>จำนวนรวม:</span>
                              <input
                                type="number"
                                value={rule.minCommitteeMembers}
                                onChange={(e) => handleUpdateTierField(rule.id, 'minCommitteeMembers', parseInt(e.target.value) || 4)}
                                className="w-14 px-1 py-0.5 bg-white border border-slate-200 rounded text-center font-bold"
                              />
                              <span>ท่าน</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Column 3: ผู้อนุมัติ การแต่งตั้งคณะกรรมการ */}
                      <td className="py-3.5 px-4 align-middle">
                        {!isEditMode ? (
                          <div className="text-slate-900 font-medium leading-relaxed">
                            {rule.appointmentApprover}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={rule.appointmentApprover || ''}
                            onChange={(e) => handleUpdateTierField(rule.id, 'appointmentApprover', e.target.value)}
                            placeholder="ระบุตำแหน่งผู้อนุมัติแต่งตั้ง"
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        )}
                      </td>

                      {/* Column 4: ผู้อนุมัติ ชี้ขาดในกรณีความเห็นไม่เป็นเอกฉันท์ */}
                      {!isEditMode ? (
                        // Standard view with row spanning for President group
                        idx === 0 ? (
                          <td className="py-3.5 px-4 align-middle">
                            <div className="text-slate-900 font-medium">
                              {rule.disputeResolutionApprover}
                            </div>
                          </td>
                        ) : isFirstOfPresidentGroup ? (
                          <td 
                            rowSpan={activeRulesList.length - 1} 
                            className="py-3.5 px-4 align-middle bg-slate-50/40 text-center text-slate-900 font-bold"
                          >
                            <div className="py-6 space-y-1">
                              <Award className="w-5 h-5 text-blue-700 mx-auto" />
                              <div className="text-sm font-bold text-slate-900">
                                {rule.disputeResolutionApprover || 'กรรมการผู้อำนวยการ'}
                              </div>
                              <div className="text-[11px] text-slate-500 font-normal">
                                (สำหรับทุกวงเงินตั้งแต่ &gt; 1 ล้านบาท ขึ้นไป)
                              </div>
                            </div>
                          </td>
                        ) : null
                      ) : (
                        // In edit mode, allow cell-by-cell editing
                        <td className="py-3.5 px-4 align-middle">
                          <input
                            type="text"
                            value={rule.disputeResolutionApprover || ''}
                            onChange={(e) => handleUpdateTierField(rule.id, 'disputeResolutionApprover', e.target.value)}
                            placeholder="ระบุตำแหน่งผู้ชี้ขาด"
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Note */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>หมายเหตุ:</strong> คณะกรรมการทุกระดับจะต้องมีตัวแทนผู้ตรวจรับงานอย่างน้อย 1 ท่าน และเลขานุการจากฝ่ายจัดซื้อ
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              SAT-PM-01 Authority Engine v3.0
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CARDS & STEP-BY-STEP SEQUENTIAL WORKFLOW DETAIL */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeRulesList.map((rule, ruleIdx) => {
            const isSelected = selectedTierId === rule.id;
            const isSimulatedMatch = simulatedRule?.id === rule.id;

            return (
              <div 
                key={rule.id} 
                className={`bg-white/95 backdrop-blur-md rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                  isSimulatedMatch ? 'ring-3 ring-emerald-500/80 shadow-lg' : 'border-sky-100 hover:shadow-md'
                }`}
              >
                {/* Rule Header */}
                <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] text-white p-6 relative">
                  {isSimulatedMatch && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1 animate-pulse">
                      <Check className="w-3 h-3" />
                      <span>วงเงินทดสอบตรงกับระดับนี้</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 text-sky-100 px-3 py-0.5 rounded-full font-bold">
                      {rule.id}
                    </span>

                    <span className="text-xs text-sky-100">
                      กรรมการ: <strong className="text-amber-300 font-black">{rule.minCommitteeMembers} ท่าน</strong>
                    </span>
                  </div>

                  {/* Tier Title */}
                  <h2 className="text-lg font-bold text-white mt-2.5">
                    {rule.tierName}
                  </h2>

                  {/* Budget Range Label */}
                  <div className="text-xs text-sky-100 mt-1.5 font-medium">
                    วงเงิน: <strong className="text-emerald-300 font-bold">{rule.budgetLabel}</strong>
                  </div>
                </div>

                {/* Rule Body: Steps */}
                <div className="p-6 space-y-4 flex-1">
                  {/* Summary Box */}
                  <div className="bg-sky-50/70 border border-sky-200/70 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-blue-900 font-bold">กรรมการตามเกณฑ์:</span>
                      <span className="text-slate-700 font-medium text-right">{rule.committeeDescription}</span>
                    </div>
                    <div className="flex items-start justify-between border-t border-sky-200/50 pt-1.5">
                      <span className="text-blue-900 font-bold">ผู้อนุมัติแต่งตั้ง:</span>
                      <span className="text-slate-900 font-bold text-right">{rule.appointmentApprover}</span>
                    </div>
                    <div className="flex items-start justify-between border-t border-sky-200/50 pt-1.5">
                      <span className="text-blue-900 font-bold">ผู้ชี้ขาดไม่เป็นเอกฉันท์:</span>
                      <span className="text-slate-900 font-bold text-right">{rule.disputeResolutionApprover}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <span>สายการอนุมัติ Digital Sequential Workflow ({rule.requiredSteps?.length || 0} ขั้นตอน):</span>
                    </div>

                    {isEditMode && (
                      <button
                        onClick={() => handleAddStep(rule.id)}
                        className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold border border-blue-200 flex items-center space-x-1 transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>เพิ่มขั้นตอน</span>
                      </button>
                    )}
                  </div>

                  {/* Steps List */}
                  <div className="space-y-2.5">
                    {rule.requiredSteps?.map((step, stepIdx) => (
                      <div 
                        key={step.stepNumber} 
                        className="p-3.5 bg-sky-50/40 border border-sky-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:border-blue-200 transition"
                      >
                        <div className="flex items-start sm:items-center space-x-3 flex-1">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs mt-0.5 sm:mt-0">
                            {step.stepNumber}
                          </div>

                          {!isEditMode ? (
                            <div className="flex-1">
                              <div className="font-bold text-slate-900">{step.title}</div>
                              <div className="text-[11px] text-slate-500">{step.defaultApproverPosition}</div>
                            </div>
                          ) : (
                            <div className="flex-1 space-y-1.5 pr-2">
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) => handleUpdateStepField(rule.id, stepIdx, 'title', e.target.value)}
                                placeholder="ตำแหน่ง / บทบาทผู้อนุมัติ"
                                className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-blue-500"
                              />
                              <input
                                type="text"
                                value={step.defaultApproverPosition}
                                onChange={(e) => handleUpdateStepField(rule.id, stepIdx, 'defaultApproverPosition', e.target.value)}
                                placeholder="คำอธิบายตำแหน่งเริ่มต้น"
                                className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:border-blue-500"
                              />
                            </div>
                          )}
                        </div>

                        {/* Right actions: Level badge & Move/Delete controls */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                          {!isEditMode ? (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[10px]">
                              ระดับ {step.levelRequired}
                            </span>
                          ) : (
                            <>
                              <select
                                value={step.levelRequired}
                                onChange={(e) => handleUpdateStepField(rule.id, stepIdx, 'levelRequired', e.target.value)}
                                className="text-[10px] bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-blue-800"
                              >
                                <option value="Officer">Officer</option>
                                <option value="Manager">Manager</option>
                                <option value="AGM">AGM</option>
                                <option value="GM">GM</option>
                                <option value="VP">VP</option>
                                <option value="EVP">EVP</option>
                                <option value="President">President</option>
                                <option value="Board">Board</option>
                              </select>

                              <button
                                onClick={() => handleMoveStep(rule.id, stepIdx, 'up')}
                                disabled={stepIdx === 0}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                                title="ย้ายขึ้น"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleMoveStep(rule.id, stepIdx, 'down')}
                                disabled={stepIdx === rule.requiredSteps.length - 1}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30"
                                title="ย้ายลง"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteStep(rule.id, step.stepNumber)}
                                className="p-1 hover:bg-rose-100 rounded text-rose-600"
                                title="ลบขั้นตอนนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer & Tier Tools */}
                <div className="bg-sky-50/30 p-4 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>PM-01 Active Rule</span>
                    </span>
                  </div>

                  {isEditMode ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDuplicateTier(rule)}
                        className="text-[11px] text-slate-600 hover:text-blue-700 font-medium px-2 py-1 rounded bg-white border border-slate-200 flex items-center space-x-1"
                        title="คัดลอกระดับนี้"
                      >
                        <Copy className="w-3 h-3" />
                        <span>คัดลอก</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTier(rule.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded bg-rose-50 border border-rose-200 flex items-center space-x-1"
                        title="ลบระดับนี้"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ลบ Tier</span>
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] text-slate-400">{rule.id}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
