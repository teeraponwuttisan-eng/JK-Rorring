import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Check, 
  PenTool, 
  ShieldCheck, 
  KeyRound, 
  RotateCcw, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { ProcurementRequest, ApprovalStep, UserProfile } from '../types/procurement';
import { SomboonLogo } from './SomboonLogo';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProcurementRequest | null;
  step: ApprovalStep | null;
  currentUser: UserProfile;
  onConfirmSignature: (comments: string, signatureData: string) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  request,
  step,
  currentUser,
  onConfirmSignature,
}) => {
  if (!isOpen || !request || !step) return null;

  const [sigMode, setSigMode] = useState<'draw' | 'type'>('type');
  const [typedName, setTypedName] = useState(currentUser.name);
  const [pinCode, setPinCode] = useState('');
  const [comments, setComments] = useState('เห็นชอบการแต่งตั้งคณะกรรมการและอนุมัติดำเนินการตามระเบียบ PM-01');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas drawing handlers
  useEffect(() => {
    if (sigMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // deep blue ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [sigMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const signatureText = sigMode === 'type' 
      ? `${typedName} [Digital Verified Signature]` 
      : `${currentUser.name} [Handwritten Signature Captured]`;

    onConfirmSignature(comments, signatureText);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ลงนามอนุมัติดิจิทัล (E-Signature)</h2>
              <p className="text-xs text-sky-200">ขั้นที่ {step.stepNumber}: {step.roleTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 text-xs">
          
          {/* Target Request Info */}
          <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100 space-y-1">
            <div className="font-bold text-slate-900">{request.documentNo}</div>
            <div className="text-slate-600 line-clamp-1">{request.title}</div>
            <div className="text-[11px] text-[#1e3a8a] font-bold">
              ผู้ลงนาม: {currentUser.name} ({currentUser.position})
            </div>
          </div>

          {/* Signature Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">รูปแบบลายมือชื่ออิเล็กทรอนิกส์:</label>
              <div className="flex space-x-1 bg-sky-50 p-1 rounded-xl border border-sky-100">
                <button
                  type="button"
                  onClick={() => setSigMode('type')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                    sigMode === 'type' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  พิมพ์ชื่อยืนยัน
                </button>
                <button
                  type="button"
                  onClick={() => setSigMode('draw')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                    sigMode === 'draw' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  วาดลายเซ็น
                </button>
              </div>
            </div>

            {sigMode === 'type' ? (
              <div className="bg-sky-50/30 p-4 rounded-2xl border border-sky-100 text-center space-y-2">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full text-center font-serif text-lg font-bold text-[#1e3a8a] bg-transparent border-b-2 border-blue-400 focus:outline-none pb-1"
                />
                <div className="text-[10px] text-slate-400">
                  ระบบจะบันทึก Digital Certificate Hash และ Timestamp ผูกกับบัญชีของท่าน
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/30 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 cursor-crosshair touch-none"
                  />
                  <div className="absolute bottom-1.5 right-2.5 text-[10px] text-slate-400 pointer-events-none font-medium">
                    เซ็นชื่อลงในกรอบนี้
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] text-rose-600 hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ล้างลายเซ็น</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              ข้อคิดเห็น / หมายเหตุการอนุมัติ:
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              placeholder="ระบุข้อคิดเห็น..."
            />
          </div>

          {/* Security PIN Code Confirmation */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>รหัส PIN ยืนยันตัวตน (6 หลัก):</span>
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="•••••• (เช่น 123456 สำหรับการทดสอบ)"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full p-2.5 bg-sky-50/30 border border-sky-200/80 rounded-xl tracking-widest text-center text-sm font-bold focus:bg-white text-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="btn-confirm-sign-final"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>ยืนยันการลงนามอนุมัติ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
