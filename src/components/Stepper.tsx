import { motion } from "framer-motion";
import { type LucideIcon, ArrowRight } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
}

/**
 * Alasan UX: nomor urut (01/02/03) di sini SAH dipakai karena kontennya
 * beneran sequential (proses assessment → analysis → recommendation →
 * result harus dijalani berurutan) — bukan dekorasi.
 * Panah penghubung ngasih tau user ini 1 alur, bukan 4 fitur terpisah.
 */
export function Stepper({ steps }: StepperProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-2">
      {steps.map((step, i) => (
        <div key={step.title} className="flex flex-1 items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600">0{i + 1}</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <step.icon size={18} className="text-blue-600" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
          </motion.div>
          {i < steps.length - 1 && (
            <ArrowRight size={18} className="hidden md:block shrink-0 text-slate-300" />
          )}
        </div>
      ))}
    </div>
  );
}
