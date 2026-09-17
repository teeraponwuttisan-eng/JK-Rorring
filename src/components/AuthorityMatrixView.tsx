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
  Layers
} from 'lucide-react';
import { AuthorityRule } from '../types/procurement';
import { formatCurrency } from '../utils/formatters';

interface AuthorityMatrixViewProps {
  rules: AuthorityRule[];
  onUpdateRule?: (rules: AuthorityRule[]) => void;
}

export const AuthorityMatrixView: React.FC<AuthorityMatrixViewProps> = ({ rules }) => {
  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Info */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-blue-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
              <Sliders className="w-3.5 h-3.5" />
              <span>Database-Driven Approval Routing</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-2">
              ผังอำนาจดำเนินการ (Authority Matrix) ตามคู่มือจัดซื้อจัดจ้าง PM-01
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              ระบบใช้ตาราง Authority Matrix ในการคำนวณและสร้างลำดับขั้นตอนการอนุมัติ (Sequential Routing) โดยอัตโนมัติตามวงเงินงบประมาณ และจำนวนกรรมการขั้นต่ำที่ต้องแต่งตั้ง
            </p>
          </div>
        </div>
      </div>

      {/* Rules Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            {/* Rule Header */}
            <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] text-white p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-white/20 text-sky-100 px-3 py-0.5 rounded-full font-bold">
                  {rule.id}
                </span>
                <span className="text-xs text-sky-100">
                  กรรมการขั้นต่ำ: <strong className="text-amber-300 font-black">{rule.minCommitteeMembers} ท่าน</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-2.5">{rule.tierName}</h2>
              <div className="text-xs text-sky-100 mt-1 font-medium">
                ช่วงวงเงิน: <strong className="text-emerald-300">{formatCurrency(rule.minBudget)}</strong> ถึง {rule.maxBudget ? <strong className="text-emerald-300">{formatCurrency(rule.maxBudget)}</strong> : 'ไม่จำกัด'}
              </div>
            </div>

            {/* Rule Body: Steps */}
            <div className="p-6 space-y-4 flex-1">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                ลำดับขั้นตอนการอนุมัติที่กำหนด (Required Approval Chain):
              </div>

              <div className="space-y-2.5">
                {rule.requiredSteps.map((step) => (
                  <div 
                    key={step.stepNumber} 
                    className="p-3.5 bg-sky-50/40 border border-sky-100 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {step.stepNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{step.title}</div>
                        <div className="text-[11px] text-slate-500">{step.defaultApproverPosition}</div>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[10px]">
                      ระดับ {step.levelRequired}
                    </span>
                  </div>
                ))}
              </div>

              {/* Committee Criteria Summary */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>เกณฑ์คณะกรรมการ PM-01:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-0.5">
                  <li>ต้องประกอบด้วยระดับผู้จัดการ (Manager) อย่างน้อย {rule.minCommitteeMembers} ท่าน</li>
                  {rule.mustIncludeAuditObserver && (
                    <li>ต้องมีผู้สังเกตการณ์จาก Internal Audit / Governance 1 ท่าน</li>
                  )}
                  <li>ต้องมีเลขานุการจากฝ่ายจัดซื้อ 1 ท่าน</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-sky-50/30 p-4 border-t border-sky-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1.5 font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active & Enforced in System</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">Dynamic Config v2.4</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
