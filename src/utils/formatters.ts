/**
 * Format currency to Thai Baht
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' บาท';
}

/**
 * Format Thai Baht text (Baht Text Converter for formal Thai internal memo)
 */
export function thaiBahtText(num: number): string {
  if (isNaN(num)) return '';
  const thaiNums = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  const [intPart, decPart = '00'] = num.toFixed(2).split('.');
  
  function convertGroup(nStr: string): string {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr[i], 10);
      const unit = units[len - 1 - i];
      if (digit !== 0) {
        if (unit === 'สิบ' && digit === 1) {
          result += 'สิบ';
        } else if (unit === 'สิบ' && digit === 2) {
          result += 'ยี่สิบ';
        } else if (unit === '' && digit === 1 && len > 1 && parseInt(nStr[len - 2], 10) !== 0) {
          result += 'เอ็ด';
        } else {
          result += thaiNums[digit] + unit;
        }
      }
    }
    return result;
  }

  let text = '';
  const intNum = parseInt(intPart, 10);
  if (intNum === 0) {
    text = 'ศูนย์บาท';
  } else {
    // Split into millions chunks if needed
    const millions = Math.floor(intNum / 1000000);
    const remainder = intNum % 1000000;
    
    if (millions > 0) {
      text += convertGroup(millions.toString()) + 'ล้าน';
    }
    if (remainder > 0 || millions === 0) {
      text += convertGroup(remainder.toString()) + 'บาท';
    } else {
      text += 'บาท';
    }
  }

  const decNum = parseInt(decPart.substring(0, 2), 10);
  if (decNum === 0) {
    text += 'ถ้วน';
  } else {
    text += convertGroup(decNum.toString()) + 'สตางค์';
  }

  return text;
}

/**
 * Format date to Thai Buddhist Era (พ.ศ.)
 */
export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
}

export function generateHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 36; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function getStatusBadge(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'approved':
      return { label: 'อนุมัติเรียบร้อย (Approved)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'pending_approval':
      return { label: 'รอการอนุมัติ (Pending)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'revision_requested':
      return { label: 'ขอให้แก้ไข (Revision)', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'rejected':
      return { label: 'ไม่อนุมัติ (Rejected)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'draft':
    default:
      return { label: 'ร่างเอกสาร (Draft)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getRoleLabelThai(role: string): string {
  switch (role) {
    case 'chairman':
      return 'ประธานกรรมการ';
    case 'member':
      return 'กรรมการ';
    case 'observer':
      return 'กรรมการสังเกตการณ์ (IA)';
    case 'secretary':
      return 'กรรมการและเลขานุการ';
    case 'co_secretary':
      return 'ผู้ช่วยเลขานุการ';
    default:
      return role;
  }
}
