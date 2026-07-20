import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

/**
 * Alasan UX: angka konkret (195+ produk, 100% BPOM) lebih meyakinkan
 * daripada klaim teks biasa — ini "social proof" versi data, bikin user
 * percaya sistemnya beneran punya basis data, bukan janji kosong.
 */
export function StatCard({ icon: Icon, value, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light">
        <Icon size={18} className="text-primary" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-ink leading-none">{value}</p>
        <p className="text-xs leading-snug text-slate-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
