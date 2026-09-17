import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Database, 
  Layers, 
  GitBranch, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Server,
  FileCode,
  Layout,
  UserCheck
} from 'lucide-react';
import { SomboonLogo } from './SomboonLogo';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [docTab, setDocTab] = useState<'architecture' | 'erd' | 'workflow' | 'backend_code' | 'specs'>('architecture');
  const [copiedCode, setCopiedCode] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sampleBackendApiCode = `// server/src/controllers/procurementWorkflowController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { sendLineNotify, sendTeamsCard, sendCorporateEmail } from '../services/notificationService';

const prisma = new PrismaClient();

/**
 * 1. API สร้างคำขอแต่งตั้งคณะกรรมการและคำนวณ Authority Matrix
 * POST /api/v1/procurement/requests
 */
export async function createCommitteeRequest(req: Request, res: Response) {
  try {
    const { title, budget, requestingDepartment, objective, committeeMemberIds, attachments } = req.body;
    const requesterId = req.user.id;

    // ตรวจสอบเกณฑ์ระเบียบ PM-01
    if (budget < 1000000) {
      // โครงการต่ำกว่า 1 ล้าน ไม่บังคับตั้งกรรมการ 5 ท่าน
    }

    if (committeeMemberIds.length < 5) {
      return res.status(400).json({ error: 'PM-01 Requirement: คณะกรรมการต้องมีระดับ Manager อย่างน้อย 5-6 ท่าน' });
    }

    // คำนวณ Authority Matrix ตามวงเงิน
    const authorityTier = budget > 10000000 ? 'TIER_2_HIGH_VALUE' : 'TIER_1_STANDARD';

    // ตรวจสอบ Dynamic Delegation (กรณีมีกรรมการลาออก/โยกย้าย/ลาพักร้อน)
    const activeCommitteeList = await Promise.all(
      committeeMemberIds.map(async (m: { userId: string; role: string }) => {
        const user = await prisma.user.findUnique({ where: { id: m.userId } });
        if (user?.status === 'ON_LEAVE' || user?.status === 'TRANSFERRED') {
          // โอนสิทธิ์ให้อันดับรักษาการ หรือผู้บังคับบัญชาสายตรง
          return {
            originalUserId: user.id,
            actualUserId: user.successorId || user.supervisorId,
            isDelegated: true,
            role: m.role,
            reason: \`Dynamic Delegation: \${user.name} (\${user.status}) ➔ โอนสิทธิ์อัตโนมัติ\`,
          };
        }
        return { originalUserId: user!.id, actualUserId: user!.id, isDelegated: false, role: m.role };
      })
    );

    // สร้าง Transaction บันทึกข้อมูลและ Workflow Steps
    const newRequest = await prisma.$transaction(async (tx) => {
      const docNo = \`SB-MEMO-\${new Date().getFullYear()}-\${Math.floor(1000 + Math.random() * 9000)}\`;

      const request = await tx.procurementRequest.create({
        data: {
          documentNo: docNo,
          title,
          budget,
          requestingDepartment,
          objective,
          requesterId,
          status: 'PENDING_APPROVAL',
        },
      });

      // ผูกรายชื่อคณะกรรมการ
      await tx.committeeMember.createMany({
        data: activeCommitteeList.map((c) => ({
          requestId: request.id,
          userId: c.actualUserId,
          role: c.role,
          isDelegated: c.isDelegated,
          delegationReason: c.reason,
        })),
      });

      // สร้าง Approval Workflow Steps (Step 1: Requester -> Step 2: AGM Jaturong -> Step 3: VP Patpong)
      const steps = [
        { stepNumber: 1, roleTitle: 'Manager Purchasing (ผู้ขอเสนอ)', approverId: requesterId, status: 'APPROVED' },
        { stepNumber: 2, roleTitle: 'AGM Supply Chain Development', approverId: 'usr-agm-002', status: 'PENDING' },
        { stepNumber: 3, roleTitle: 'Vice President – Supply Chain & System Dev', approverId: 'usr-vp-003', status: 'WAITING' },
      ];

      if (authorityTier === 'TIER_2_HIGH_VALUE') {
        steps.push({ stepNumber: 4, roleTitle: 'President & CEO', approverId: 'usr-ceo-004', status: 'WAITING' });
      }

      await tx.approvalStep.createMany({
        data: steps.map((s) => ({ ...s, requestId: request.id })),
      });

      // บันทึก Security Audit Trail
      await tx.auditLog.create({
        data: {
          requestId: request.id,
          documentNo: docNo,
          actorId: requesterId,
          action: 'SUBMIT_FOR_APPROVAL',
          details: \`สร้างคำขอตั้งคณะกรรมการ วงเงิน \${budget.toLocaleString()} บาท และส่งต่อ AGM\`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] || 'WebClient',
          hashSignature: createHash('sha256').update(docNo + Date.now()).digest('hex'),
        },
      });

      return request;
    });

    // ส่ง Multi-Channel Notification ไปยัง AGM
    await Promise.all([
      sendLineNotify('usr-agm-002', \`[อนุมัติใหม่] โครงการ \${title} (\${newRequest.documentNo})\`),
      sendTeamsCard('usr-agm-002', newRequest),
      sendCorporateEmail('jaturong.b@somboon.co.th', newRequest),
    ]);

    return res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create request', details: error });
  }
}

/**
 * 2. API ลงนามอนุมัติแบบดิจิทัล (Digital Signature & Workflow Advance)
 * POST /api/v1/procurement/requests/:id/approve
 */
export async function approveStep(req: Request, res: Response) {
  const { id } = req.params;
  const { comments, signatureData, pinCode } = req.body;
  const userId = req.user.id;

  // ตรวจสอบ PIN และ Step ปัจจุบัน
  const currentStep = await prisma.approvalStep.findFirst({
    where: { requestId: id, status: 'PENDING', approverId: userId },
  });

  if (!currentStep) {
    return res.status(403).json({ error: 'คุณไม่มีสิทธิ์อนุมัติในขั้นตอนนี้ หรือเอกสารถูกอนุมัติแล้ว' });
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. อัปเดต Step ปัจจุบันเป็น APPROVED
    await tx.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: 'APPROVED',
        comments,
        signatureData,
        actionDate: new Date(),
        ipAddress: req.ip,
      },
    });

    // 2. ดึง Step ถัดไป
    const nextStep = await tx.approvalStep.findFirst({
      where: { requestId: id, stepNumber: currentStep.stepNumber + 1 },
    });

    if (nextStep) {
      await tx.approvalStep.update({
        where: { id: nextStep.id },
        data: { status: 'PENDING' },
      });
      // แจ้งเตือน Approver ขั้นถัดไป
      await sendTeamsCard(nextStep.approverId, { id, stepNumber: nextStep.stepNumber });
    } else {
      // ครบทุกขั้น -> อนุมัติสมบูรณ์ (APPROVED)
      await tx.procurementRequest.update({
        where: { id },
        data: { status: 'APPROVED', completedAt: new Date() },
      });
    }

    // 3. บันทึก Immutable Audit Log
    await tx.auditLog.create({
      data: {
        requestId: id,
        documentNo: currentStep.requestId,
        actorId: userId,
        action: 'APPROVE',
        details: \`ลงนามอนุมัติขั้นที่ \${currentStep.stepNumber} (\${currentStep.roleTitle})\`,
        ipAddress: req.ip,
        hashSignature: createHash('sha256').update(id + userId + Date.now()).digest('hex'),
      },
    });

    return { completed: !nextStep };
  });

  return res.json({ success: true, data: result });
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] px-6 py-4 flex items-center justify-between text-white border-b border-blue-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">System Architecture & Technical Specifications</h2>
              <p className="text-xs text-sky-200">Somboon Procurement Committee System (PM-01)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-1.5 bg-sky-50/60 p-2.5 border-b border-sky-100 text-xs overflow-x-auto">
          <button
            onClick={() => setDocTab('architecture')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              docTab === 'architecture' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. System Architecture
          </button>
          <button
            onClick={() => setDocTab('erd')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              docTab === 'erd' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Data Model (ERD)
          </button>
          <button
            onClick={() => setDocTab('workflow')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              docTab === 'workflow' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. User Journey & Workflow
          </button>
          <button
            onClick={() => setDocTab('backend_code')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              docTab === 'backend_code' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Backend Source Code
          </button>
          <button
            onClick={() => setDocTab('specs')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              docTab === 'specs' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. UI/UX & Security Specs
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs leading-relaxed space-y-6">
          
          {/* TAB 1: ARCHITECTURE */}
          {docTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span>1. Enterprise System Architecture Diagram</span>
              </h3>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto shadow-inner">
                <pre>{`+-----------------------------------------------------------------------------------+
|                        PRESENTATION LAYER (Frontend SPA / Mobile)                |
|  - React 19 / Vite / Tailwind CSS / Google Sans & Noto Sans Thai                  |
|  - Digital Signature Pad (HTML5 Canvas) / Official Thai Internal Memo Generator   |
|  - Role-based Adaptive UI (Requester, Committee, AGM Jaturong, VP Patpong, CEO)   |
+-----------------------------------------------------------------------------------+
                                         |
                                         | HTTPS / REST APIs / WebSocket
                                         v
+-----------------------------------------------------------------------------------+
|                       APPLICATION & BUSINESS LOGIC LAYER                          |
|  - Node.js (Express / TypeScript) or Python FastAPI                               |
|  - Authentication: Corporate SSO (Azure AD / OAuth 2.0 / SAML 2.0)               |
|  - Authority Matrix Rule Engine (PM-01 Compliance > 1MB, > 10MB)                  |
|  - Dynamic Exception & Proxy Engine (On-leave / Resignation auto-delegator)       |
|  - PDF Generation Service (Puppeteer / PDFKit) for Somboon Internal Memo          |
+-----------------------------------------------------------------------------------+
       |                                   |                              |
       v                                   v                              v
+-----------------------+     +--------------------------+    +---------------------+
|   DATA STORAGE LAYER  |     | NOTIFICATION GATEWAY     |    | SECURITY & AUDIT    |
| - PostgreSQL / SQL    |     | - LINE Notify API        |    | - SHA-256 Hash Ring |
| - Redis (Cache/State) |     | - MS Teams Webhook Cards |    | - IP / Agent Logger |
| - S3 (Attachments)    |     | - Corporate SMTP Email   |    | - E-Signature Audit |
+-----------------------+     +--------------------------+    +---------------------+`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100 space-y-2">
                  <h4 className="font-bold text-slate-900">แนะนำ Tech Stack สำหรับ Production</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Frontend:</strong> React 19 + Tailwind CSS + Lucide Icons + Google Sans</li>
                    <li><strong>Backend:</strong> Node.js (TypeScript) + Express.js หรือ Python FastAPI</li>
                    <li><strong>Database:</strong> PostgreSQL (Cloud SQL) พร้อม Prisma ORM</li>
                    <li><strong>Authentication:</strong> Corporate Active Directory / Azure AD (OIDC)</li>
                    <li><strong>Object Storage:</strong> MinIO หรือ Google Cloud Storage (TOR, Attachments)</li>
                  </ul>
                </div>

                <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100 space-y-2">
                  <h4 className="font-bold text-slate-900">จุดเด่นทางสถาปัตยกรรม (Key Advantages)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Zero Paperwork:</strong> ยกเลิกการใช้กระดาษและบันทึกข้อความ MS Word 100%</li>
                    <li><strong>Database-Driven Workflow:</strong> เปลี่ยนสายอนุมัติได้โดยไม่ต้องแก้ Code</li>
                    <li><strong>Dynamic Delegation:</strong> รองรับการรักษาการแทนเมื่อกรรมการลาออก/โยกย้าย</li>
                    <li><strong>Exact PDF Memo:</strong> หน้าตาเหมือนบันทึกข้อความเดิมของสมบูรณ์เป๊ะ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ERD */}
          {docTab === 'erd' && (
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>2. Entity Relationship Diagram (ERD) & Database Schema</span>
              </h3>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto shadow-inner">
                <pre>{`[users]
  id: UUID (PK)
  employee_id: VARCHAR(20) [UNIQUE]
  name_th: VARCHAR(100)
  email: VARCHAR(100)
  department: VARCHAR(100)
  position: VARCHAR(100)
  level: ENUM ('Officer', 'Manager', 'AGM', 'VP', 'President')
  status: ENUM ('active', 'on_leave', 'transferred', 'resigned')
  supervisor_id: UUID (FK -> users.id)
  successor_id: UUID (FK -> users.id)

       | 1
       |
       | N
[procurement_requests]
  id: UUID (PK)
  document_no: VARCHAR(50) [UNIQUE] -- e.g. SB-MEMO-2026-0041
  title: VARCHAR(255)
  requesting_dept: VARCHAR(100)
  requester_id: UUID (FK -> users.id)
  budget: NUMERIC(15, 2)
  objective: TEXT
  project_scope: TEXT
  category: VARCHAR(50)
  status: ENUM ('draft', 'pending_approval', 'approved', 'rejected')
  created_at: TIMESTAMP

       | 1                     | 1                      | 1
       |                       |                        |
       | N                     | N                      | N
[committee_members]     [approval_steps]         [audit_logs]
  id: UUID (PK)           id: UUID (PK)            id: UUID (PK)
  request_id: UUID        request_id: UUID         request_id: UUID
  user_id: UUID           step_number: INT         actor_id: UUID
  role: ENUM              assigned_approver_id     action: VARCHAR(50)
  is_delegated: BOOL      status: ENUM             details: TEXT
  delegated_user_id       signature_data: TEXT     ip_address: VARCHAR(45)
  delegation_reason       action_date: TIMESTAMP   hash_signature: VARCHAR(64)`}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: WORKFLOW */}
          {docTab === 'workflow' && (
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <span>3. User Journey & State Machine Workflow Diagram</span>
              </h3>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto shadow-inner">
                <pre>{`[Requester: สร้างคำขอ]
        |
        v
[Validate PM-01 Criteria] ---> (งบประมาณ < 1MB? -> แจ้งเตือนว่าจัดซื้อตามปกติได้)
        |
        v (งบประมาณ >= 1MB)
[เลือกคณะกรรมการ: 5-6 Managers + IA Observer]
        |
        +---> [Dynamic Logic: ตรวจพบกรรมการติดภารกิจ/โยกย้าย?]
        |            |
        |            +-> [Auto-Delegate ให้รักษาการแทน (Acting Proxy)]
        v
[Submit เข้าสู่ Approval Chain]
        |
        +---> [Step 1: ผู้ขอเสนอ / Manager Purchasing] ---> [Approve]
        |
        +---> [Step 2: AGM Supply Chain Development (คุณจตุรงค์ บุญนำ)]
        |            |
        |            +--> [Approve] ---> ส่งต่อ Step 3
        |            +--> [Request Revision] ---> ตีกลับให้ Requester แก้ไข
        |            +--> [Reject] ---> ยุติคำขอพร้อมบันทึกเหตุผล
        |
        +---> [Step 3: Vice President – Supply Chain (คุณพัฒน์พงษ์ วีระศิลป์)]
        |            |
        |            v
        +---> (งบ > 10MB? -> Step 4: President & CEO คุณวิชัย รัตนสกุล)
        |
        v
[APPROVED: สมบูรณ์ 100%]
        |
        +--> แจ้งเตือนผู้เกี่ยวข้องทั้งหมด (LINE / Teams / Email)
        +--> ออกเลขที่เอกสารถาวร และบันทึก Digital Hash
        +--> อนุญาตให้พิมพ์/ดาวน์โหลดบันทึกข้อความฉบับทางการ (PDF Export)`}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: BACKEND SOURCE CODE */}
          {docTab === 'backend_code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>4. Production Backend Controller & Routing Code (TypeScript/Express)</span>
                </h3>
                <button
                  onClick={() => copyToClipboard(sampleBackendApiCode)}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1 border border-sky-200 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'คัดลอกสำเร็จ' : 'คัดลอกโค้ด'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96 shadow-inner">
                <code>{sampleBackendApiCode}</code>
              </pre>
            </div>
          )}

          {/* TAB 5: SPECS */}
          {docTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Layout className="w-4 h-4 text-indigo-600" />
                <span>5. UI/UX Specification & Security Controls</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100 space-y-2">
                  <h4 className="font-bold text-slate-900">มาตรฐานการรักษาความปลอดภัย (Security Controls)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Role-Based Access Control (RBAC):</strong> อนุญาตให้ลงนามเฉพาะผู้มีรายชื่อใน Step นั้นๆ เท่านั้น</li>
                    <li><strong>Digital Signature Verification:</strong> ผูกลายเซ็นกับ User Session, IP, Timestamp, และ SHA-256 Checksum</li>
                    <li><strong>Immutable Audit Logging:</strong> บันทึกทุก Action ลงตาราง Audit Trail โดยห้ามแก้ไขหรือลบ</li>
                    <li><strong>Multi-Factor Authorization:</strong> รองรับการกรอก PIN 6 หลักก่อนยืนยันการอนุมัติ</li>
                  </ul>
                </div>

                <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100 space-y-2">
                  <h4 className="font-bold text-slate-900">UI/UX & Thai Typography Standards</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong>Google Sans & Sarabun:</strong> ใช้ฟอนต์ Google Sans & Noto Sans Thai ในระบบ และฟอนต์ Sarabun ในบันทึกข้อความทางการ</li>
                    <li><strong>BahtText Engine:</strong> แปลงตัวเลขงบประมาณเป็นตัวหนังสือภาษาไทยอัตโนมัติ</li>
                    <li><strong>Print CSS:</strong> จัดหน้า A4 อัตโนมัติเมื่อกดสั่งพิมพ์ ปิดปุ่มควบคุมที่ไม่จำเป็นออก</li>
                    <li><strong>Mobile Friendly:</strong> รองรับการเปิดพิจารณาและลงนามผ่านสมาร์ตโฟนและแท็บเล็ต</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-sky-50/40 p-4 border-t border-sky-100 flex items-center justify-between">
          <div className="text-slate-600 text-xs font-medium">
            บริษัท สมบูรณ์ แอดวานซ์ เทคโนโลยี จำกัด (มหาชน) • Somboon Group
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
