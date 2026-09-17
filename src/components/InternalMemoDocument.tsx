import React, { useRef } from 'react';
import { 
  Printer, 
  FileDown, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Sparkles,
  Award
} from 'lucide-react';
import { ProcurementRequest } from '../types/procurement';
import { formatCurrency, formatThaiDate, getRoleLabelThai, thaiBahtText } from '../utils/formatters';
import { SomboonLogo } from './SomboonLogo';

interface InternalMemoDocumentProps {
  request: ProcurementRequest;
}

export const InternalMemoDocument: React.FC<InternalMemoDocumentProps> = ({ request }) => {
  const memoRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white/95 backdrop-blur-md text-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs border border-sky-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-blue-600 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">เอกสารบันทึกข้อความภายในทางการ (Official Internal Memo)</div>
            <div className="text-xs text-slate-500">รูปแบบมาตรฐาน บริษัท สมบูรณ์ รองรับการส่งออกเป็น PDF และสั่งพิมพ์กระดาษ A4</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            id="btn-print-memo"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เอกสาร / บันทึกเป็น PDF (Print A4)</span>
          </button>
        </div>
      </div>

      {/* The Printable A4 Memorandum Sheet */}
      <div 
        ref={memoRef}
        className="print-page bg-white max-w-4xl mx-auto p-10 sm:p-14 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 font-sarabun text-slate-900 leading-normal print:p-0 print:border-0 print:shadow-none print:max-w-none print:w-full"
      >
        {/* Memo Header with Somboon Official Logo */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-start justify-between">
            {/* Somboon Logo */}
            <div className="flex items-center space-x-4">
              <SomboonLogo variant="horizontal" size="lg" />
            </div>

            {/* Document Reference Badge */}
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900 text-sm">บันทึกข้อความ (Internal Memo)</div>
              <div className="font-mono text-slate-700 mt-0.5">เลขที่: <span className="font-bold text-slate-900">{request.documentNo}</span></div>
              <div className="text-slate-600 text-xs mt-0.5">วันที่: {request.internalMemoDate || formatThaiDate(request.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Memo Meta Fields */}
        <div className="grid grid-cols-2 gap-y-2 text-sm border-b border-slate-300 pb-4 mb-5">
          <div>
            <span className="font-bold text-slate-800">ส่วนงาน / หน่วยงาน: </span>
            <span className="text-slate-900">{request.requestingDepartment}</span>
          </div>
          <div>
            <span className="font-bold text-slate-800">เบอร์โทรศัพท์ภายใน: </span>
            <span className="text-slate-900">ฝ่ายจัดซื้อ ต่อ 4102-4105</span>
          </div>
          <div className="col-span-2">
            <span className="font-bold text-slate-800">เรื่อง: </span>
            <span className="font-semibold text-slate-900 underline underline-offset-4 decoration-slate-400">
              {request.title}
            </span>
          </div>
          <div className="col-span-2 pt-1">
            <span className="font-bold text-slate-800">เรียน: </span>
            <span className="text-slate-900">
              Vice President – Supply Chain & System Development / กรรมการผู้จัดการใหญ่ (ผ่านตามลำดับชั้น)
            </span>
          </div>
        </div>

        {/* Memo Body Content */}
        <div className="space-y-4 text-sm leading-relaxed text-justify text-slate-800 mb-6">
          <p className="indent-8">
            ด้วยหน่วยงาน <strong className="text-slate-900">{request.requestingDepartment}</strong> มีความประสงค์จะดำเนินโครงการ <strong className="text-slate-900">{request.title}</strong> โดยมีวงเงินงบประมาณรวมทั้งสิ้น <strong className="text-blue-900 font-bold">{formatCurrency(request.budget)} ({thaiBahtText(request.budget)})</strong> ซึ่งเข้าข่ายตามระเบียบคู่มือการจัดซื้อจัดจ้าง (PM-01) ของบริษัท สมบูรณ์ ว่าด้วยโครงการที่มีมูลค่าเกิน 1,000,000 บาทขึ้นไป จะต้องแต่งตั้งคณะกรรมการคัดเลือกและตรวจรับงานระดับผู้จัดการ (Manager) อย่างน้อย 5-6 ท่าน พร้อมกรรมการสังเกตการณ์จากหน่วยงานกำกับดูแล
          </p>

          <p className="indent-8">
            <strong className="text-slate-900">วัตถุประสงค์และความจำเป็น:</strong> {request.objective}
          </p>

          {request.projectScope && (
            <p className="indent-8">
              <strong className="text-slate-900">ขอบเขตงาน (Project Scope):</strong> {request.projectScope}
            </p>
          )}

          <p className="indent-8">
            เพื่อให้การจัดซื้อจัดจ้างโครงการดังกล่าวเป็นไปด้วยความโปร่งใส ถูกต้องตามหลักธรรมาภิบาล และสอดคล้องกับมาตรฐาน PM-01 ฝ่ายงานจึงขออนุมัติแต่งตั้งคณะกรรมการคัดเลือกและตรวจรับงาน โดยมีรายนามและบทบาทหน้าที่ดังต่อไปนี้:
          </p>

          {/* Committee Table in Memo */}
          <div className="my-4 overflow-hidden border border-slate-400 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                  <th className="py-2 px-3 w-10 text-center font-bold border-r border-slate-300">ลำดับ</th>
                  <th className="py-2 px-3 font-bold border-r border-slate-300">ชื่อ - นามสกุล</th>
                  <th className="py-2 px-3 font-bold border-r border-slate-300">ตำแหน่ง / ฝ่ายงาน</th>
                  <th className="py-2 px-3 font-bold text-center">บทบาทในคณะกรรมการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {request.committeeMembers.map((member, index) => {
                  const isChair = member.role === 'chairman';
                  const isObs = member.role === 'observer';
                  return (
                    <tr key={member.id} className={isChair ? 'bg-amber-50/40' : isObs ? 'bg-sky-50/40' : ''}>
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-medium">{index + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-300 font-semibold text-slate-900">
                        {member.user.name}
                        {member.isDelegated && (
                          <div className="text-[10px] text-purple-700 italic font-normal">
                            (ปฏิบัติหน้าที่แทนโดย: {member.delegatedToUser?.name})
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-slate-700">
                        {member.user.position} ({member.department})
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">
                        {getRoleLabelThai(member.role)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="indent-8">
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติแต่งตั้งคณะกรรมการคัดเลือกและตรวจรับงานตามรายนามข้างต้น เพื่อจักได้ดำเนินการในขั้นตอนการจัดซื้อจัดจ้างตามระเบียบบริษัทต่อไป
          </p>
        </div>

        {/* Official Digital Sign-off Blocks */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 text-center">
            ตารางการพิจารณาและลงนามอนุมัติตามลำดับอำนาจดำเนินการ (Authority Approval Chain)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {request.approvalWorkflow.map((step, idx) => {
              const isApproved = step.status === 'approved';
              return (
                <div 
                  key={idx} 
                  className="border border-slate-400 rounded-xl p-3 text-center text-xs flex flex-col justify-between bg-slate-50/50"
                >
                  <div>
                    <div className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                      ขั้นที่ {step.stepNumber}: {step.roleTitle}
                    </div>

                    <div className="min-h-[60px] flex flex-col items-center justify-center">
                      {isApproved ? (
                        <div className="space-y-1">
                          <div className="font-serif italic font-bold text-blue-900 text-sm tracking-wide">
                            {step.signatureData || step.assignedApprover.name}
                          </div>
                          <div className="inline-flex items-center space-x-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>อนุมัติแล้ว (Digitally Signed)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px]">
                          [รอการพิจารณาลงนาม]
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-900">({step.assignedApprover.name})</div>
                    <div>{step.assignedApprover.position}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {step.actionDate ? `วันที่: ${step.actionDate}` : 'วันที่: .............. / .............. / ..............'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Certified Document • Somboon Security Token: <strong>0x8F2D...99BF</strong></span>
          </div>
          <div className="font-mono text-[10px]">
            ISO 9001 / IATF 16949 Compliant e-Procurement Record
          </div>
        </div>
      </div>
    </div>
  );
};
