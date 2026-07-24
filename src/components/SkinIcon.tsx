import type { ReactNode } from "react";

/**
 * SkinIcon -- ilustrasi abstrak buat tiap pilihan Tipe Kulit & Concern
 * di Assessment Wizard. SENGAJA dibuat sebagai ilustrasi vektor sederhana
 * (bukan foto wajah asli) untuk menghindari isu hak cipta dan representasi
 * -- semua bentuk wajah di sini abstrak/generik, bukan orang tertentu.
 *
 * Gaya konsisten: wajah oval dasar + simbol overlay yang mewakili kondisi.
 * Warna mengikuti design system (primary/gold/warning/red).
 */

type SkinIconKey =
  | "kering" | "berminyak" | "sensitif" | "kombinasi" | "normal"
  | "rawan-jerawat" | "semua-tipe-kulit" | "dehidrasi"
  | "jerawat-aktif" | "bekas-jerawat" | "kulit-kusam" | "tanda-penuaan"
  | "pori-besar" | "kemerahan-iritasi";

function FaceBase({ fill = "#F3EFE9" }: { fill?: string }) {
  return (
    <>
      <ellipse cx="32" cy="34" rx="19" ry="22" fill={fill} />
      <path d="M17 30 Q14 34 17 40" stroke="#D8CFC2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M47 30 Q50 34 47 40" stroke="#D8CFC2" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}

function Eyes({ color = "#5B5147" }: { color?: string }) {
  return (
    <>
      <path d="M23 30 Q26 27 29 30" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M35 30 Q38 27 41 30" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

const ICONS: Record<SkinIconKey, ReactNode> = {
  kering: (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#F0E9DD" />
      <Eyes />
      <path d="M26 40 Q28 42 26 44" stroke="#C9B896" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M34 41 Q37 43 35 46" stroke="#C9B896" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M29 46 Q31 48 29 50" stroke="#C9B896" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  berminyak: (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#EFF3EE" />
      <Eyes />
      <ellipse cx="32" cy="26" rx="6" ry="4" fill="#BFE0D6" opacity="0.8" />
      <ellipse cx="24" cy="38" rx="2.5" ry="2" fill="#BFE0D6" opacity="0.7" />
      <ellipse cx="40" cy="38" rx="2.5" ry="2" fill="#BFE0D6" opacity="0.7" />
    </svg>
  ),
  sensitif: (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#FBEFEF" />
      <Eyes />
      <ellipse cx="22" cy="39" rx="5" ry="3.5" fill="#F3C6C6" opacity="0.8" />
      <ellipse cx="42" cy="39" rx="5" ry="3.5" fill="#F3C6C6" opacity="0.8" />
    </svg>
  ),
  kombinasi: (
    <svg viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="rightHalf"><rect x="32" y="10" width="20" height="50" /></clipPath>
      </defs>
      <FaceBase fill="#F0E9DD" />
      <g clipPath="url(#rightHalf)">
        <ellipse cx="32" cy="34" rx="19" ry="22" fill="#EFF3EE" />
      </g>
      <Eyes />
      <path d="M22 41 Q24 43 22 45" stroke="#C9B896" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="27" rx="4" ry="3" fill="#BFE0D6" opacity="0.8" />
      <line x1="32" y1="12" x2="32" y2="56" stroke="#D8CFC2" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  ),
  normal: (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#F2EFE8" />
      <Eyes />
      <path d="M27 43 Q32 46 37 43" stroke="#5B5147" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="49" cy="18" r="7" fill="#E8EFEC" />
      <path d="M46 18 L48.5 20.5 L52.5 15.5" stroke="#4F7A6A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "rawan-jerawat": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#F0E9DD" />
      <Eyes />
      <circle cx="25" cy="41" r="2" fill="#E28B8B" />
      <circle cx="38" cy="44" r="1.6" fill="#E28B8B" />
      <circle cx="30" cy="47" r="1.8" fill="#E28B8B" />
      <circle cx="41" cy="35" r="1.4" fill="#E28B8B" />
    </svg>
  ),
  "semua-tipe-kulit": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#EDEEF2" />
      <Eyes />
      <path d="M27 43 Q32 46 37 43" stroke="#5B5147" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="46" r="9" fill="#4F7A6A" />
      <path d="M44 46 L47 49 L53 42" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dehidrasi: (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#EFEAE0" />
      <Eyes />
      <path d="M25 41 Q27 43 25 46 Q23 43 25 41" stroke="#C9B896" strokeWidth="1.2" fill="none" />
      <path d="M39 42 Q41 44 39 47" stroke="#C9B896" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M49 15 C46 20 44 24 49 27 C54 24 52 20 49 15Z" fill="#9DB8CF" opacity="0.5" />
      <line x1="44" y1="30" x2="54" y2="12" stroke="#B45309" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  "jerawat-aktif": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#FBEFEF" />
      <Eyes />
      <circle cx="24" cy="40" r="2.6" fill="#D9534F" />
      <circle cx="24" cy="40" r="4.4" fill="#D9534F" opacity="0.25" />
      <circle cx="39" cy="44" r="2.2" fill="#D9534F" />
      <circle cx="39" cy="44" r="4" fill="#D9534F" opacity="0.25" />
      <circle cx="33" cy="35" r="1.8" fill="#D9534F" />
    </svg>
  ),
  "bekas-jerawat": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#F0E9DD" />
      <Eyes />
      <circle cx="25" cy="41" r="1.8" fill="#A47B5A" />
      <circle cx="38" cy="45" r="1.6" fill="#A47B5A" />
      <circle cx="32" cy="48" r="1.4" fill="#A47B5A" />
      <circle cx="40" cy="36" r="1.3" fill="#A47B5A" />
    </svg>
  ),
  "kulit-kusam": (
    <svg viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="34" rx="19" ry="22" fill="#D9D4C8" />
      <Eyes color="#8A8175" />
      <path d="M27 43 Q32 45 37 43" stroke="#8A8175" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M46 12 L49 18 L55 19 L50.5 23 L52 29 L46 26 L40 29 L41.5 23 L37 19 L43 18Z" fill="#D9B66B" opacity="0.9" />
    </svg>
  ),
  "tanda-penuaan": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#F2EFE8" />
      <path d="M21 28 Q24 26 27 28" stroke="#5B5147" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M37 28 Q40 26 43 28" stroke="#5B5147" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M18 32 Q15 33 18 35" stroke="#C9B896" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M46 32 Q49 33 46 35" stroke="#C9B896" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M26 44 Q32 47 38 44" stroke="#5B5147" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  "pori-besar": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#EFEAE0" />
      <Eyes />
      <g fill="#B7AC9A">
        <circle cx="29" cy="38" r="0.9" /><circle cx="33" cy="37" r="0.9" /><circle cx="31" cy="41" r="0.9" />
        <circle cx="35" cy="40" r="0.9" /><circle cx="28" cy="42" r="0.9" /><circle cx="37" cy="43" r="0.9" />
        <circle cx="32" cy="44" r="0.9" />
      </g>
    </svg>
  ),
  "kemerahan-iritasi": (
    <svg viewBox="0 0 64 64" fill="none">
      <FaceBase fill="#FBEFEF" />
      <Eyes />
      <ellipse cx="23" cy="40" rx="6" ry="4.5" fill="#E28B8B" opacity="0.7" />
      <ellipse cx="41" cy="40" rx="6" ry="4.5" fill="#E28B8B" opacity="0.7" />
      <ellipse cx="32" cy="30" rx="4" ry="3" fill="#E28B8B" opacity="0.5" />
    </svg>
  ),
};

export default function SkinIcon({ type, size = 40 }: { type: SkinIconKey; size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      {ICONS[type]}
    </div>
  );
}

// Map dari label teks (yang dipakai di Assessment.tsx) ke key ilustrasi
export const SKIN_TYPE_ICON_MAP: Record<string, SkinIconKey> = {
  "Kering": "kering",
  "Berminyak": "berminyak",
  "Sensitif": "sensitif",
  "Kombinasi": "kombinasi",
  "Normal": "normal",
  "Rawan Jerawat": "rawan-jerawat",
  "Semua Tipe Kulit": "semua-tipe-kulit",
  "Dehidrasi": "dehidrasi",
};

export const CONCERN_ICON_MAP: Record<string, SkinIconKey> = {
  "Jerawat Aktif": "jerawat-aktif",
  "Bekas Jerawat / Noda Hitam": "bekas-jerawat",
  "Kulit Kusam": "kulit-kusam",
  "Tanda Penuaan": "tanda-penuaan",
  "Pori Besar": "pori-besar",
  "Kemerahan / Iritasi": "kemerahan-iritasi",
  "Dehidrasi": "dehidrasi",
};
