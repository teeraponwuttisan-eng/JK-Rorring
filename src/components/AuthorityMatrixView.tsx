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
  ChevronUp
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

  // Simulation test state
  const [testBudget, setTestBudget] = useState<number>(12500000);

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

  // Handle Reset to Default PM-01
  const handleResetDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตผังอำนาจดำเนินการกลับเป็นค่ามาตรฐานระเบียบ PM-01 ใช่หรือไม่?')) {
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

  // Load 3-Tier Enterprise Preset
  const handleApply3TierPreset = () => {
    const preset3Tier: AuthorityRule[] = [
      {
        id: 'rule-tier-0',
        tierName: 'PM-01 Tier 0: โครงการขนาดเล็ก ต่ำกว่า 1,000,000 บาท (Fast-Track)',
        minBudget: 1,
        maxBudget: 999999,
        minCommitteeMembers: 3,
        mustIncludeAuditObserver: false,
        requiredSteps: [
          {
            stepNumber: 1,
            title: 'ผู้ขอเสนอแต่งตั้ง / Manager Purchasing',
            levelRequired: 'Manager',
            defaultApproverPosition: 'Manager - Strategic Purchasing',
          },
          {
            stepNumber: 2,
            title: 'AGM Supply Chain Development',
            levelRequired: 'AGM',
            defaultApproverPosition: 'AGM - Supply Chain Development (คุณจตุรงค์ บุญนำ)',
          }
        ]
      },
      {
        id: 'rule-tier-1',
        tierName: 'PM-01 Tier 1: โครงการจัดซื้อ 1,000,000 - 10,000,000 บาท',
        minBudget: 1000000,
        maxBudget: 10000000,
        minCommitteeMembers: 5,
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
            title: 'AGM Supply Chain Development',
            levelRequired: 'AGM',
            defaultApproverPosition: 'AGM - Supply Chain Development (คุณจตุรงค์ บุญนำ)',
          },
          {
            stepNumber: 3,
            title: 'Vice President – Supply Chain & System Development',
            levelRequired: 'VP',
            defaultApproverPosition: 'Vice President – Supply Chain (คุณพัฒน์พงษ์ วีระศิลป์)',
          }
        ]
      },
      {
        id: 'rule-tier-2',
        tierName: 'PM-01 Tier 2: โครงการจัดซื้อขนาดใหญ่ เกิน 10,000,000 บาท ขึ้นไป',
        minBudget: 10000001,
        maxBudget: null,
        minCommitteeMembers: 6,
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
            title: 'AGM Supply Chain Development',
            levelRequired: 'AGM',
            defaultApproverPosition: 'AGM - Supply Chain Development (คุณจตุรงค์ บุญนำ)',
          },
          {
            stepNumber: 3,
            title: 'Vice President – Supply Chain & System Development',
            levelRequired: 'VP',
            defaultApproverPosition: 'Vice President – Supply Chain (คุณพัฒน์พงษ์ วีระศิลป์)',
          },
          {
            stepNumber: 4,
            title: 'President & Chief Executive Officer',
            levelRequired: 'President',
            defaultApproverPosition: 'President & CEO (คุณวิชัย รัตนสกุล)',
          }
        ]
      }
    ];

    setEditingRules(preset3Tier);
    setIsEditMode(true);
  };

  // Add a new Tier
  const handleAddNewTier = () => {
    const newTierNum = editingRules.length + 1;
    const newTier: AuthorityRule = {
      id: `rule-tier-${Date.now().toString().slice(-4)}`,
      tierName: `PM-01 Tier ${newTierNum}: โครงการกำหนดเอง (Custom Budget Tier)`,
      minBudget: 20000000,
      maxBudget: null,
      minCommitteeMembers: 6,
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
          title: 'AGM Supply Chain Development',
          levelRequired: 'AGM',
          defaultApproverPosition: 'AGM - Supply Chain Development',
        },
        {
          stepNumber: 3,
          title: 'Vice President – Supply Chain',
          levelRequired: 'VP',
          defaultApproverPosition: 'Vice President – Supply Chain',
        },
        {
          stepNumber: 4,
          title: 'President & Chief Executive Officer',
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
        // Re-index stepNumbers
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

        // Swap
        const temp = steps[stepIndex];
        steps[stepIndex] = steps[targetIndex];
        steps[targetIndex] = temp;

        // Re-index
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
              <span>Database-Driven Approval Routing</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">ผู้ใช้งานสามารถปรับแต่งได้ (Customizable Matrix)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              ผังอำนาจดำเนินการ (Authority Matrix) ตามคู่มือจัดซื้อจัดจ้าง PM-01
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              ระบบใช้ตาราง Authority Matrix ในการคำนวณและสร้างลำดับขั้นตอนการอนุมัติ (Sequential Routing) โดยอัตโนมัติตามวงเงินงบประมาณ และจำนวนกรรมการขั้นต่ำที่ต้องแต่งตั้ง
            </p>
          </div>

          {/* Action Buttons: Edit / Save / Preset */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-2 transition transform active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>ปรับแต่งผังอำนาจ (Adjust Rules)</span>
                </button>

                <button
                  onClick={handleAddNewTier}
                  className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-blue-700 border border-sky-200/80 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มระดับใหม่</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนแปลง (Save Matrix)</span>
                </button>

                <button
                  onClick={() => {
                    setEditingRules(JSON.parse(JSON.stringify(rules)));
                    setIsEditMode(false);
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  ยกเลิก
                </button>
              </>
            )}

            <div className="relative group">
              <button
                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1 transition"
                title="ตัวเลือกแม่แบบผังอำนาจ"
              >
                <span>แม่แบบ Preset</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 hidden group-hover:block z-20 space-y-1 text-xs">
                <button
                  onClick={handleResetDefault}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-xl font-medium text-slate-700 flex items-center space-x-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>มาตรฐาน PM-01 (2 Tiers)</span>
                </button>
                <button
                  onClick={handleApply3TierPreset}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-xl font-medium text-slate-700 flex items-center space-x-2"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>แบบองค์กรใหญ่ (3 Tiers)</span>
                </button>
              </div>
            </div>
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
                  ท่านสามารถแก้ไขชื่อระดับ, ช่วงวงเงินงบประมาณ, จำนวนกรรมการขั้นต่ำ, เพิ่ม/ลด/สลับขั้นตอนการอนุมัติได้อิสระ
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleAddNewTier}
                className="px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มระดับ Tier ใหม่</span>
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
              <span>เครื่องมือจำลองคำนวณสายอนุมัติอัตโนมัติ (Dynamic Routing Simulator)</span>
            </div>
            <p className="text-xs text-sky-100/80">
              ทดสอบกรอกวงเงินงบประมาณเพื่อดูว่าระบบจะเลือกใช้ผังอำนาจระดับใด และสร้างสายการอนุมัติกี่ขั้นตอน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <label className="text-xs text-sky-200 font-medium">ทดสอบวงเงินงบประมาณ:</label>
            <div className="relative">
              <input
                type="number"
                value={testBudget}
                onChange={(e) => setTestBudget(Number(e.target.value) || 0)}
                className="w-40 px-3 py-1.5 bg-white text-slate-900 font-bold text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                step="500000"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium pointer-events-none">บาท</span>
            </div>

            <div className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-semibold flex items-center space-x-1.5">
              <span>ผลลัพธ์:</span>
              <strong className="text-white underline">{simulatedRule?.tierName?.split(':')[0] || 'Tier Matched'}</strong>
              <span>({simulatedRule?.requiredSteps?.length || 0} ขั้นตอน)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Cards Grid */}
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

                  {!isEditMode ? (
                    <span className="text-xs text-sky-100">
                      กรรมการขั้นต่ำ: <strong className="text-amber-300 font-black">{rule.minCommitteeMembers} ท่าน</strong>
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-sky-200">กรรมการขั้นต่ำ:</label>
                      <input
                        type="number"
                        min="3"
                        max="12"
                        value={rule.minCommitteeMembers}
                        onChange={(e) => handleUpdateTierField(rule.id, 'minCommitteeMembers', parseInt(e.target.value) || 3)}
                        className="w-16 px-2 py-0.5 bg-white text-slate-900 rounded-lg text-xs font-bold text-center"
                      />
                      <span className="text-xs text-sky-100">ท่าน</span>
                    </div>
                  )}
                </div>

                {/* Tier Title */}
                {!isEditMode ? (
                  <h2 className="text-lg font-bold text-white mt-2.5">{rule.tierName}</h2>
                ) : (
                  <div className="mt-2.5">
                    <label className="text-[10px] text-sky-200 uppercase font-bold block mb-1">ชื่อระดับและคำอธิบาย:</label>
                    <input
                      type="text"
                      value={rule.tierName}
                      onChange={(e) => handleUpdateTierField(rule.id, 'tierName', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/95 text-slate-900 rounded-xl text-sm font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                )}

                {/* Budget Range */}
                {!isEditMode ? (
                  <div className="text-xs text-sky-100 mt-2 font-medium">
                    ช่วงวงเงิน: <strong className="text-emerald-300 font-bold">{formatCurrency(rule.minBudget)}</strong> ถึง{' '}
                    {rule.maxBudget ? (
                      <strong className="text-emerald-300 font-bold">{formatCurrency(rule.maxBudget)}</strong>
                    ) : (
                      <strong className="text-amber-300 font-bold">ไม่จำกัด (Unlimited)</strong>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-sky-200 uppercase font-bold block mb-1">วงเงินเริ่มต้น (บาท):</label>
                      <input
                        type="number"
                        value={rule.minBudget}
                        onChange={(e) => handleUpdateTierField(rule.id, 'minBudget', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1 bg-white text-slate-900 rounded-lg font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-sky-200 uppercase font-bold block mb-1">วงเงินสูงสุด (0 หรือว่าง = ไม่จำกัด):</label>
                      <input
                        type="number"
                        placeholder="ไม่จำกัด"
                        value={rule.maxBudget ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          handleUpdateTierField(rule.id, 'maxBudget', val);
                        }}
                        className="w-full px-2.5 py-1 bg-white text-slate-900 rounded-lg font-bold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Rule Body: Steps */}
              <div className="p-6 space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>ลำดับขั้นตอนการอนุมัติ ({rule.requiredSteps.length} ขั้นตอน):</span>
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
                  {rule.requiredSteps.map((step, stepIdx) => (
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

                {/* Committee Criteria Summary & Checkboxes */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                  <div className="font-bold flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>เกณฑ์คณะกรรมการ PM-01 ประจำระดับนี้:</span>
                    </div>
                  </div>

                  {!isEditMode ? (
                    <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-1">
                      <li>ต้องประกอบด้วยระดับผู้จัดการ (Manager) อย่างน้อย <strong>{rule.minCommitteeMembers} ท่าน</strong></li>
                      {rule.mustIncludeAuditObserver ? (
                        <li className="text-emerald-800 font-semibold">✓ ต้องมีผู้สังเกตการณ์จาก Internal Audit / Governance 1 ท่าน</li>
                      ) : (
                        <li className="text-slate-500">○ ไม่บังคับผู้สังเกตการณ์ Audit (โครงการขนาดเล็ก)</li>
                      )}
                      <li>ต้องมีเลขานุการจากฝ่ายจัดซื้อ 1 ท่าน</li>
                    </ul>
                  ) : (
                    <div className="space-y-2 pt-1 border-t border-amber-200/50">
                      <label className="flex items-center space-x-2 cursor-pointer text-[11px] text-amber-900">
                        <input
                          type="checkbox"
                          checked={rule.mustIncludeAuditObserver}
                          onChange={(e) => handleUpdateTierField(rule.id, 'mustIncludeAuditObserver', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="font-semibold">บังคับให้มีผู้สังเกตการณ์จาก Internal Audit / Governance</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer & Tier Tools */}
              <div className="bg-sky-50/30 p-4 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Active In Engine</span>
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
                  <span className="font-mono text-[11px] text-slate-400">Dynamic Config v2.4</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
