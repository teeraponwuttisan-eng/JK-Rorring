export interface ProjectCategoryItem {
  id: string;
  labelTh: string;
  labelEn: string;
  groupTh: string;
  groupEn: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const PROJECT_CATEGORIES: ProjectCategoryItem[] = [
  // 1. Production & Engineering
  {
    id: 'Engineering & Machinery',
    labelTh: 'เครื่องจักรและวิศวกรรมการผลิต',
    labelEn: 'Engineering & Machinery',
    groupTh: 'สายการผลิตและวิศวกรรม (Production & Eng)',
    groupEn: 'Production & Engineering',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'จัดซื้อเครื่องจักรหลัก เครื่องกลึง CNC สายการผลิต Die Casting และอุปกรณ์ทางวิศวกรรม',
  },
  {
    id: 'Automation & Robotics',
    labelTh: 'ระบบอัตโนมัติและหุ่นยนต์อุตสาหกรรม',
    labelEn: 'Automation & Robotics',
    groupTh: 'สายการผลิตและวิศวกรรม (Production & Eng)',
    groupEn: 'Production & Engineering',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    description: 'หุ่นยนต์อุตสาหกรรม แขนกลอัจฉริยะ ระบบเซนเซอร์ IoT และระบบ Smart Factory',
  },
  {
    id: 'Tooling, Moulds & Dies',
    labelTh: 'แม่พิมพ์ จิ๊ก และอุปกรณ์การผลิต',
    labelEn: 'Tooling, Moulds & Dies',
    groupTh: 'สายการผลิตและวิศวกรรม (Production & Eng)',
    groupEn: 'Production & Engineering',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    description: 'จัดทำแม่พิมพ์ปั๊มขึ้นรูป Die Moulds, Jig & Fixtures และชุดเครื่องมือตัดเฉือนความแม่นยำสูง',
  },
  {
    id: 'R&D & Quality Metrology',
    labelTh: 'วิจัย พัฒนา และเครื่องมือตรวจสอบคุณภาพ (QA/QC)',
    labelEn: 'R&D & Quality Metrology',
    groupTh: 'สายการผลิตและวิศวกรรม (Production & Eng)',
    groupEn: 'Production & Engineering',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    badgeBorder: 'border-teal-200',
    description: 'เครื่องมือวัด 3 มิติ (CMM), เครื่องทดสอบแรงดึง ความแข็ง และอุปกรณ์ห้องปฏิบัติการทดสอบ',
  },

  // 2. Plant, Facility & Sustainability
  {
    id: 'Energy & Green Utilities',
    labelTh: 'พลังงาน สาธารณูปโภค และความยั่งยืน ESG',
    labelEn: 'Energy & Green Utilities',
    groupTh: 'พลังงานและโครงสร้างโรงงาน (Plant & Energy)',
    groupEn: 'Plant & Energy',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    description: 'ระบบโซลาร์รูฟท็อป แบตเตอรี่ BESS ระบบบำบัดน้ำเสีย หม้อแปลงไฟฟ้า และการจัดการคาร์บอน',
  },
  {
    id: 'Factory & Facility Expansion',
    labelTh: 'ก่อสร้าง ต่อเติม และปรับปรุงอาคารโรงงาน',
    labelEn: 'Factory & Facility Expansion',
    groupTh: 'พลังงานและโครงสร้างโรงงาน (Plant & Energy)',
    groupEn: 'Plant & Energy',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'งานโยธา ก่อสร้างขยายไลน์ผลิต ปรับปรุงพื้น Epoxy คลังสินค้า และระบบปรับอากาศ HVAC',
  },
  {
    id: 'Smart MRO & Spare Parts',
    labelTh: 'งานซ่อมบำรุงและอะไหล่โรงงาน (MRO)',
    labelEn: 'Smart MRO & Spare Parts',
    groupTh: 'พลังงานและโครงสร้างโรงงาน (Plant & Energy)',
    groupEn: 'Plant & Energy',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
    description: 'สัญญาบริการซ่อมบำรุงเครื่องจักรเชิงป้องกัน (PM/Overhaul) และจัดซื้อชุดอะไหล่สำรองมูลค่าสูง',
  },

  // 3. Supply Chain, Logistics & Materials
  {
    id: 'Supply Chain & Logistics',
    labelTh: 'คลังสินค้า โลจิสติกส์ และระบบ AGV',
    labelEn: 'Supply Chain & Logistics',
    groupTh: 'โลจิสติกส์และห่วงโซ่อุปทาน (Supply Chain)',
    groupEn: 'Supply Chain',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    description: 'ระบบคลังสินค้าอัตโนมัติ (AS/RS), รถลำเลียง AGV, ชั้นวาง Racking และสัญญาขนส่งสินค้า',
  },
  {
    id: 'Raw Materials & Core Parts',
    labelTh: 'วัตถุดิบหลักและชิ้นส่วนประกอบยานยนต์',
    labelEn: 'Raw Materials & Core Parts',
    groupTh: 'โลจิสติกส์และห่วงโซ่อุปทาน (Supply Chain)',
    groupEn: 'Supply Chain',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    description: 'สัญญาจัดซื้อเหล็กกล้า อะลูมิเนียมอินกอต สารเคมีอุตสาหกรรม และชิ้นส่วนยานยนต์ระยะยาว',
  },
  {
    id: 'Corporate Fleet & Transport',
    labelTh: 'ยานพาหนะ รถยก และการเดินทางองค์กร',
    labelEn: 'Corporate Fleet & Transport',
    groupTh: 'โลจิสติกส์และห่วงโซ่อุปทาน (Supply Chain)',
    groupEn: 'Supply Chain',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    description: 'จัดซื้อหรือเช่าซื้อรถยกไฟฟ้า (Electric Forklift), รถบรรทุกขนส่ง และรถตู้รับส่งพนักงาน',
  },

  // 4. Digital, IT & Governance
  {
    id: 'IT & Digital Infrastructure',
    labelTh: 'เทคโนโลยีสารสนเทศ ซอฟต์แวร์ และระบบคลาวด์',
    labelEn: 'IT & Digital Infrastructure',
    groupTh: 'ไอทีและบริการวิชาชีพ (IT & Services)',
    groupEn: 'IT & Services',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    badgeBorder: 'border-violet-200',
    description: 'ระบบ ERP (SAP), เซิร์ฟเวอร์ Cyber Security, Cloud Infrastructure, ระบบเน็ตเวิร์ก และลิขสิทธิ์ซอฟต์แวร์',
  },
  {
    id: 'Safety, Health & Environment (SHE)',
    labelTh: 'ความปลอดภัย อาชีวอนามัย และสิ่งแวดล้อม',
    labelEn: 'Safety, Health & Environment (SHE)',
    groupTh: 'ไอทีและบริการวิชาชีพ (IT & Services)',
    groupEn: 'IT & Services',
    badgeBg: 'bg-green-50',
    badgeText: 'text-green-700',
    badgeBorder: 'border-green-200',
    description: 'ระบบป้องกันและระงับอัคคีภัยอัตโนมัติ กล้องวงจรปิดความปลอดภัย และอุปกรณ์ความปลอดภัยโรงงาน',
  },
  {
    id: 'Consulting & Professional Services',
    labelTh: 'บริการที่ปรึกษา งานวิชาชีพ และวิศวกรรมเฉพาะทาง',
    labelEn: 'Consulting & Professional Services',
    groupTh: 'ไอทีและบริการวิชาชีพ (IT & Services)',
    groupEn: 'IT & Services',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    description: 'จ้างที่ปรึกษาการจัดการ ที่ปรึกษาระบบ IATF/ISO งานประเมิน Carbon Footprint และบริการกฎหมาย/ตรวจสอบ',
  },
  {
    id: 'Office Facilities & General Services',
    labelTh: 'ครุภัณฑ์สำนักงานและงานบริการทั่วไป',
    labelEn: 'Office Facilities & General Services',
    groupTh: 'ไอทีและบริการวิชาชีพ (IT & Services)',
    groupEn: 'IT & Services',
    badgeBg: 'bg-zinc-100',
    badgeText: 'text-zinc-700',
    badgeBorder: 'border-zinc-300',
    description: 'ปรับปรุงอาคารสำนักงานใหญ่ สัญญาบริการรักษาความปลอดภัย และงานบริการสนับสนุนองค์กร',
  }
];

export function getCategoryMeta(categoryId: string): ProjectCategoryItem {
  const found = PROJECT_CATEGORIES.find(c => c.id === categoryId);
  if (found) return found;
  return {
    id: categoryId,
    labelTh: categoryId,
    labelEn: categoryId,
    groupTh: 'หมวดหมู่อื่นๆ',
    groupEn: 'Other Categories',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    description: categoryId
  };
}
