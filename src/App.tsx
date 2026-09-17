import React, { useState } from 'react';
import { 
  mockUsers, 
  mockRequests, 
  mockAuthorityRules, 
  mockAuditLogs, 
  mockNotifications 
} from './data/mockData';
import { 
  UserProfile, 
  ProcurementRequest, 
  ApprovalStep, 
  AuditLogEntry, 
  NotificationLog, 
  AuthorityRule 
} from './types/procurement';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RequestDetailView } from './components/RequestDetailView';
import { CreateRequestModal } from './components/CreateRequestModal';
import { DigitalSignatureModal } from './components/DigitalSignatureModal';
import { AuthorityMatrixView } from './components/AuthorityMatrixView';
import { AuditTrailView } from './components/AuditTrailView';
import { NotificationView } from './components/NotificationView';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { SomboonLogo } from './components/SomboonLogo';
import { generateHash } from './utils/formatters';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[1]); // Default to คุณจตุรงค์ บุญนำ (AGM) to highlight pending approval
  const [requests, setRequests] = useState<ProcurementRequest[]>(mockRequests);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [notifications, setNotifications] = useState<NotificationLog[]>(mockNotifications);
  const [rules, setRules] = useState<AuthorityRule[]>(mockAuthorityRules);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(mockRequests[0]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [signatureModalState, setSignatureModalState] = useState<{
    isOpen: boolean;
    request: ProcurementRequest | null;
    step: ApprovalStep | null;
  }>({
    isOpen: false,
    request: null,
    step: null,
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogAudit = (actionName: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      requestId: 'system-config',
      documentNo: 'SYSTEM-AUTHORITY-MATRIX',
      timestamp: new Date().toLocaleString('th-TH'),
      actorId: currentUser.id,
      actorName: `${currentUser.name} (${currentUser.position})`,
      actorRole: 'System Administrator / Approver',
      action: 'SUBMIT_FOR_APPROVAL' as any,
      details,
      ipAddress: '192.168.10.12',
      userAgent: navigator.userAgent,
      hashSignature: generateHash(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast('ปรับปรุงผังอำนาจดำเนินการ (Authority Matrix) เรียบร้อยแล้ว');
  };

  // Calculate pending count for current user
  const pendingCountForUser = requests.filter(r => {
    if (r.status !== 'pending_approval') return false;
    const currentStep = r.approvalWorkflow[r.currentStepIndex];
    return currentStep && currentStep.assignedApproverId === currentUser.id && currentStep.status === 'pending';
  }).length;

  // Handle New Request Creation
  const handleCreateRequest = (newRequest: ProcurementRequest) => {
    setRequests([newRequest, ...requests]);
    setIsCreateModalOpen(false);

    // Create Audit Log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      requestId: newRequest.id,
      documentNo: newRequest.documentNo,
      timestamp: new Date().toLocaleString('th-TH'),
      actorId: currentUser.id,
      actorName: `${currentUser.name} (${currentUser.position})`,
      actorRole: 'Requester / ผู้ขอเสนอ',
      action: 'SUBMIT_FOR_APPROVAL',
      details: `สร้างและยื่นคำขอแต่งตั้งคณะกรรมการโครงการ "${newRequest.title}" วงเงิน ${newRequest.budget.toLocaleString()} บาท เข้าสู่สายการอนุมัติตามคู่มือ PM-01`,
      ipAddress: '192.168.10.45',
      userAgent: navigator.userAgent,
      hashSignature: generateHash(),
    };
    setAuditLogs([newLog, ...auditLogs]);

    // Dispatch Notification to next Approver (Step 2 - AGM)
    const nextStep = newRequest.approvalWorkflow[1];
    if (nextStep) {
      const newNotif: NotificationLog = {
        id: `notif-${Date.now()}`,
        requestId: newRequest.id,
        recipientEmail: nextStep.assignedApprover.email,
        recipientName: nextStep.assignedApprover.name,
        channel: 'LINE Notify',
        subject: `📢 [รอการอนุมัติ] ขอแต่งตั้งคณะกรรมการ: ${newRequest.title}`,
        messageBody: `เรียน ${nextStep.assignedApprover.name}, มีรายการขออนุมัติแต่งตั้งคณะกรรมการ ${newRequest.documentNo} รอการพิจารณาอนุมัติของท่านในระบบ`,
        sentAt: new Date().toLocaleString('th-TH'),
        status: 'sent',
      };
      setNotifications([newNotif, ...notifications]);
    }

    showToast(`ยื่นคำขอ ${newRequest.documentNo} เรียบร้อยแล้ว`);
    setSelectedRequest(newRequest);
  };

  // Handle Digital Signature Confirm (Step Approval)
  const handleConfirmSignature = (comments: string, signatureData: string) => {
    if (!signatureModalState.request || !signatureModalState.step) return;

    const req = signatureModalState.request;
    const currentStepIndex = req.currentStepIndex;
    const updatedWorkflow = [...req.approvalWorkflow];

    // Mark current step as approved
    updatedWorkflow[currentStepIndex] = {
      ...updatedWorkflow[currentStepIndex],
      status: 'approved',
      actionDate: new Date().toLocaleString('th-TH'),
      comments,
      signatureData,
      actualApproverId: currentUser.id,
      actualApprover: currentUser,
      ipAddress: '192.168.10.12',
    };

    const isFinalStep = currentStepIndex === updatedWorkflow.length - 1;
    let nextStepIndex = currentStepIndex;

    if (!isFinalStep) {
      nextStepIndex = currentStepIndex + 1;
      updatedWorkflow[nextStepIndex] = {
        ...updatedWorkflow[nextStepIndex],
        status: 'pending',
      };
    }

    const updatedRequest: ProcurementRequest = {
      ...req,
      approvalWorkflow: updatedWorkflow,
      currentStepIndex: nextStepIndex,
      status: isFinalStep ? 'approved' : 'pending_approval',
      updatedAt: new Date().toISOString(),
    };

    setRequests(requests.map(r => r.id === req.id ? updatedRequest : r));
    if (selectedRequest?.id === req.id) {
      setSelectedRequest(updatedRequest);
    }

    // Add Audit Log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      requestId: req.id,
      documentNo: req.documentNo,
      timestamp: new Date().toLocaleString('th-TH'),
      actorId: currentUser.id,
      actorName: `${currentUser.name} (${currentUser.position})`,
      actorRole: updatedWorkflow[currentStepIndex].roleTitle,
      action: 'APPROVE',
      details: `ลงนามอนุมัติดิจิทัลในฐานะ ${updatedWorkflow[currentStepIndex].roleTitle} ${isFinalStep ? '➔ อนุมัติครบถ้วนสมบูรณ์ (APPROVED)' : `➔ ส่งต่อไปยัง ${updatedWorkflow[nextStepIndex].assignedApprover.name}`}`,
      ipAddress: '192.168.10.12',
      userAgent: navigator.userAgent,
      hashSignature: generateHash(),
    };
    setAuditLogs([newLog, ...auditLogs]);

    // Send notifications
    if (!isFinalStep) {
      const nextApprover = updatedWorkflow[nextStepIndex].assignedApprover;
      const notif: NotificationLog = {
        id: `notif-${Date.now()}`,
        requestId: req.id,
        recipientEmail: nextApprover.email,
        recipientName: nextApprover.name,
        channel: 'Microsoft Teams',
        subject: `⚡ Action Required: ขออนุมัติแต่งตั้งคณะกรรมการ ${req.documentNo}`,
        messageBody: `เรียน ${nextApprover.name}, ${currentUser.name} ได้ลงนามอนุมัติแล้ว ขอส่งต่อเอกสาร ${req.documentNo} มายังท่านเพื่อพิจารณาอนุมัติขั้นสุดท้าย`,
        sentAt: new Date().toLocaleString('th-TH'),
        status: 'sent',
      };
      setNotifications([notif, ...notifications]);
    } else {
      const notif: NotificationLog = {
        id: `notif-${Date.now()}`,
        requestId: req.id,
        recipientEmail: req.requester.email,
        recipientName: req.requester.name,
        channel: 'Email',
        subject: `✅ [อนุมัติเรียบร้อย] คำขอแต่งตั้งคณะกรรมการ ${req.documentNo} ผ่านการอนุมัติแล้ว`,
        messageBody: `เรียน ${req.requester.name}, เอกสารบันทึกข้อความขอแต่งตั้งคณะกรรมการโครงการ ${req.title} ได้รับการอนุมัติครบถ้วนจากผู้บริหารระดับสูงแล้ว ท่านสามารถสั่งพิมพ์บันทึกข้อความทางการได้ทันที`,
        sentAt: new Date().toLocaleString('th-TH'),
        status: 'sent',
      };
      setNotifications([notif, ...notifications]);
    }

    setSignatureModalState({ isOpen: false, request: null, step: null });
    showToast(`ลงนามอนุมัติ ${req.documentNo} สำเร็จแล้ว`);
  };

  // Handle Reject Request
  const handleRejectRequest = (req: ProcurementRequest, reason: string) => {
    const updatedWorkflow = [...req.approvalWorkflow];
    updatedWorkflow[req.currentStepIndex] = {
      ...updatedWorkflow[req.currentStepIndex],
      status: 'rejected',
      actionDate: new Date().toLocaleString('th-TH'),
      comments: `ไม่อนุมัติ: ${reason}`,
      actualApproverId: currentUser.id,
      actualApprover: currentUser,
    };

    const updatedRequest: ProcurementRequest = {
      ...req,
      approvalWorkflow: updatedWorkflow,
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    };

    setRequests(requests.map(r => r.id === req.id ? updatedRequest : r));
    if (selectedRequest?.id === req.id) {
      setSelectedRequest(updatedRequest);
    }

    // Audit Log
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      requestId: req.id,
      documentNo: req.documentNo,
      timestamp: new Date().toLocaleString('th-TH'),
      actorId: currentUser.id,
      actorName: `${currentUser.name} (${currentUser.position})`,
      actorRole: updatedWorkflow[req.currentStepIndex].roleTitle,
      action: 'REJECT',
      details: `ไม่อนุมัติคำขอ ${req.documentNo} เนื่องจาก: ${reason}`,
      ipAddress: '192.168.10.12',
      userAgent: navigator.userAgent,
      hashSignature: generateHash(),
    };
    setAuditLogs([newLog, ...auditLogs]);
    showToast(`บันทึกสถานะไม่อนุมัติ ${req.documentNo}`);
  };

  // Handle Request Revision
  const handleRequestRevision = (req: ProcurementRequest, comment: string) => {
    const updatedRequest: ProcurementRequest = {
      ...req,
      status: 'revision_requested',
      updatedAt: new Date().toISOString(),
    };

    setRequests(requests.map(r => r.id === req.id ? updatedRequest : r));
    if (selectedRequest?.id === req.id) {
      setSelectedRequest(updatedRequest);
    }

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      requestId: req.id,
      documentNo: req.documentNo,
      timestamp: new Date().toLocaleString('th-TH'),
      actorId: currentUser.id,
      actorName: `${currentUser.name} (${currentUser.position})`,
      actorRole: req.approvalWorkflow[req.currentStepIndex].roleTitle,
      action: 'REQUEST_REVISION',
      details: `ส่งคำขอกลับเพื่อแก้ไข: "${comment}"`,
      ipAddress: '192.168.10.12',
      userAgent: navigator.userAgent,
      hashSignature: generateHash(),
    };
    setAuditLogs([newLog, ...auditLogs]);
    showToast(`ส่งเอกสารกลับให้ผู้ขอแก้ไขเรียบร้อยแล้ว`);
  };

  // Quick Sign Trigger
  const handleQuickSign = (req: ProcurementRequest) => {
    const currentStep = req.approvalWorkflow[req.currentStepIndex];
    if (currentStep) {
      setSignatureModalState({
        isOpen: true,
        request: req,
        step: currentStep,
      });
    }
  };

  // View Memo Direct
  const handleViewMemo = (req: ProcurementRequest) => {
    setSelectedRequest(req);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans text-slate-900">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1e3a8a] text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-300/30 flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-4">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedRequest(null);
        }}
        pendingCountForUser={pendingCountForUser}
        onOpenNewRequest={() => setIsCreateModalOpen(true)}
        onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* If a Request is selected for detailed inspection */}
        {selectedRequest ? (
          <RequestDetailView
            request={selectedRequest}
            currentUser={currentUser}
            onBack={() => setSelectedRequest(null)}
            onOpenSignatureModal={(req, step) => {
              setSignatureModalState({
                isOpen: true,
                request: req,
                step: step,
              });
            }}
            onRejectRequest={handleRejectRequest}
            onRequestRevision={handleRequestRevision}
            onSimulateException={() => {}}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                requests={requests}
                currentUser={currentUser}
                onSelectRequest={(req) => setSelectedRequest(req)}
                onOpenNewRequest={() => setIsCreateModalOpen(true)}
                onQuickSign={handleQuickSign}
                onViewMemo={handleViewMemo}
              />
            )}

            {activeTab === 'authority_matrix' && (
              <AuthorityMatrixView 
                rules={rules} 
                onUpdateRules={(newRules) => setRules(newRules)}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeTab === 'audit_trail' && (
              <AuditTrailView logs={auditLogs} />
            )}

            {activeTab === 'notifications' && (
              <NotificationView notifications={notifications} requests={requests} />
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreateRequest}
        rules={rules}
      />

      <DigitalSignatureModal
        isOpen={signatureModalState.isOpen}
        onClose={() => setSignatureModalState({ isOpen: false, request: null, step: null })}
        request={signatureModalState.request}
        step={signatureModalState.step}
        currentUser={currentUser}
        onConfirmSignature={handleConfirmSignature}
      />

      <ArchitectureDocsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="no-print bg-white/90 backdrop-blur-md border-t border-sky-100 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <SomboonLogo className="h-5 w-auto" />
            <span>SOMBOON GROUP e-Procurement Committee & Approval System (PM-01)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            มาตรฐาน ISO 9001 / IATF 16949 • Secure Digital Signature
          </div>
        </div>
      </footer>
    </div>
  );
}
