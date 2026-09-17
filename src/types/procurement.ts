export type RequestStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'revision_requested';

export type CommitteeRole = 
  | 'chairman'             // ประธานกรรมการ (Manager)
  | 'member'               // กรรมการคัดเลือก/ตรวจรับ (Manager)
  | 'observer'             // กรรมการสังเกตการณ์ (Internal Audit / Compliance)
  | 'secretary'            // กรรมการและเลขานุการ
  | 'co_secretary';        // ผู้ช่วยเลขานุการ

export type MemberStatus = 'active' | 'on_leave' | 'transferred' | 'resigned';

export interface UserProfile {
  id: string;
  employeeId: string;
  name: string;
  nameEn: string;
  email: string;
  department: string;
  division: string;
  position: string;
  level: 'Officer' | 'Supervisor' | 'Manager' | 'AGM' | 'VP' | 'EVP' | 'President';
  avatarUrl: string;
  status: MemberStatus;
  supervisorId?: string;
  successorId?: string;
  signatureUrl?: string;
}

export interface CommitteeMemberEntry {
  id: string;
  userId: string;
  user: UserProfile;
  role: CommitteeRole;
  department: string;
  isDelegated?: boolean;
  delegatedToUser?: UserProfile;
  delegationReason?: string;
}

export interface ApprovalStep {
  stepNumber: number;
  roleTitle: string;
  assignedApproverId: string;
  assignedApprover: UserProfile;
  actualApproverId?: string;
  actualApprover?: UserProfile;
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'waiting';
  actionDate?: string;
  comments?: string;
  signatureData?: string;
  ipAddress?: string;
  delegationNote?: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  category: 'TOR' | 'Budget_Approval' | 'PR_Document' | 'Quotation' | 'Other';
}

export interface ProcurementRequest {
  id: string;
  documentNo: string; // e.g., SOM-MEMO-2026-0042
  title: string;
  requestingDepartment: string;
  requesterId: string;
  requester: UserProfile;
  budget: number;
  objective: string;
  projectScope: string;
  category: 'Engineering & Machinery' | 'IT & Digital Infrastructure' | 'Factory Expansion' | 'Supply Chain Logistics' | 'Energy & Utilities';
  targetStartDate: string;
  targetCompletionDate: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentFile[];
  committeeMembers: CommitteeMemberEntry[];
  approvalWorkflow: ApprovalStep[];
  currentStepIndex: number;
  internalMemoDate: string;
  urgentLevel: 'normal' | 'urgent' | 'very_urgent';
}

export interface AuditLogEntry {
  id: string;
  requestId: string;
  documentNo: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'CREATE_DRAFT' | 'SUBMIT_FOR_APPROVAL' | 'APPROVE' | 'REJECT' | 'REQUEST_REVISION' | 'DELEGATE_SUCCESSOR' | 'EXPORT_PDF' | 'NOTIFY_DISPATCH';
  details: string;
  ipAddress: string;
  userAgent: string;
  hashSignature: string;
}

export interface NotificationLog {
  id: string;
  requestId: string;
  recipientEmail: string;
  recipientName: string;
  channel: 'Email' | 'LINE Notify' | 'Microsoft Teams';
  subject: string;
  messageBody: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

export interface AuthorityRule {
  id: string;
  tierName: string;
  minBudget: number;
  maxBudget: number | null;
  requiredSteps: {
    stepNumber: number;
    title: string;
    levelRequired: string;
    defaultApproverPosition: string;
  }[];
  minCommitteeMembers: number;
  mustIncludeAuditObserver: boolean;
}
