import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

/**
 * Alasan UX: card dengan icon + judul + deskripsi singkat itu pola yang
 * udah familiar (dipakai Stripe/Linear) — user bisa scan cepat 3 poin
 * tanpa harus baca paragraf panjang. Stagger animation (delay per index)
 * ngarahin mata user baca card dari kiri ke kanan secara alami.
 */
export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: "0 12px 28px rgba(15,23,42,0.08)" }}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
        <Icon size={22} className="text-blue-600" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </motion.div>
  );
}
