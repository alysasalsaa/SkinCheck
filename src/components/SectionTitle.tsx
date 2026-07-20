import { motion } from "framer-motion";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

/**
 * Alasan UX: tiap section butuh identitas visual yang konsisten biar user
 * nggak "tersesat" pas scroll — eyebrow label (kata kecil di atas judul)
 * ngasih konteks section apa ini sebelum baca judul besarnya.
 */
export function SectionTitle({ eyebrow, title, subtitle, align = "center" }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-500 text-base max-w-xl">{subtitle}</p>
      )}
    </motion.div>
  );
}
