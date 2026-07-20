import { motion } from "framer-motion";
import {
  HeartPulse, Recycle, Factory, ArrowDown,
  Users, Building2, GraduationCap, X, Check, BadgeCheck, ShieldCheck, Database, Globe2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";

const SDG_COLORS: Record<string, string> = {
  "SDG 3": "bg-[#4C9F38]",
  "SDG 4": "bg-[#C5192D]",
  "SDG 9": "bg-[#FD6925]",
  "SDG 12": "bg-[#BF8B2E]",
};

const FEATURE_SDG_MAP = [
  { feature: "BPOM Verification", sdg: "SDG 3" },
  { feature: "AI Recommendation", sdg: "SDG 3" },
  { feature: "Explainable AI", sdg: "SDG 4" },
  { feature: "Local Product Recommendation", sdg: "SDG 9" },
  { feature: "Evidence-Based Recommendation", sdg: "SDG 12" },
];

const BENEFITS = [
  {
    icon: Users,
    title: "Manfaat bagi Pengguna",
    items: [
      "Rekomendasi skincare berbasis kandungan, bukan tren",
      "Tau alasan di balik tiap rekomendasi (Explainable AI)",
      "Semua produk terverifikasi BPOM",
    ],
  },
  {
    icon: Building2,
    title: "Manfaat bagi Industri Lokal",
    items: [
      "Mendorong penggunaan skincare produksi Indonesia",
      "Brand lokal mendapat exposure berbasis data, bukan iklan",
      "Mendukung ekosistem kecantikan lokal yang lebih kompetitif",
    ],
  },
  {
    icon: GraduationCap,
    title: "Manfaat bagi Pendidikan",
    items: [
      "Mengenalkan konsep Knowledge Graph & Explainable AI secara terapan",
      "Studi kasus nyata rule-based expert system di bidang kesehatan kulit",
      "Mendorong riset lanjutan berbasis evidence di bidang AI kesehatan",
    ],
  },
];

export default function Impact() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-ink">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Impact</span>
          <h1 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
            Bukan Sekadar Rekomendasi &mdash; Dampak Nyata
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            SkinCheck dirancang untuk berkontribusi terhadap kesehatan masyarakat,
            konsumsi yang bertanggung jawab, dan pertumbuhan industri lokal Indonesia.
          </p>
        </motion.div>
      </section>

      {/* ===== MENGAPA AI INI PENTING (Before/After) ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <SectionTitle eyebrow="Konteks" title="Mengapa AI Ini Penting?" subtitle="Bukan soal teknologinya — tapi soal dampaknya ke cara orang memilih skincare." />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Sebelum */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
                <X size={14} className="text-red-600" />
              </div>
              <span className="text-sm font-bold text-red-700">Sebelum</span>
            </div>
            <div className="flex flex-col gap-3">
              {["Memilih skincare karena tren TikTok", "Risiko breakout / iritasi", "Pemborosan biaya coba-coba produk"].map((t) => (
                <div key={t} className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm text-slate-600">
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Sesudah */}
          <div className="rounded-2xl border border-success-light bg-success-light/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success-light">
                <Check size={14} className="text-success" />
              </div>
              <span className="text-sm font-bold text-success">Sesudah</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {["Skin Assessment", "AI Recommendation", "Explainable AI", "Produk Lokal Terverifikasi", "Lebih Aman & Tepat Sasaran"].map((t, i, arr) => (
                <div key={t}>
                  <div className="flex items-center gap-2 rounded-lg bg-white p-3 text-sm font-medium text-slate-700">
                    {t}
                  </div>
                  {i < arr.length - 1 && <ArrowDown size={14} className="mx-auto my-1 text-success" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <span className="text-sm text-slate-400">Berkontribusi terhadap</span>
          <div className="flex flex-wrap justify-center gap-2">
            {["SDG 3", "SDG 9", "SDG 12"].map((s) => (
              <span key={s} className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-white ${SDG_COLORS[s]}`}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SDG DETAIL ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <SectionTitle eyebrow="SDGs" title="Sustainable Development Goals yang Didukung" />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { icon: HeartPulse, tag: "SDG 3", title: "Good Health and Well-being", desc: "Rekomendasi aman, sesuai kondisi kulit, terverifikasi BPOM." },
            { icon: Recycle, tag: "SDG 12", title: "Responsible Consumption", desc: "Mengurangi pembelian impulsif berbasis tren, mendorong keputusan berbasis evidence." },
            { icon: Factory, tag: "SDG 9", title: "Industry & Innovation", desc: "Mendukung produk skincare lokal Indonesia lewat teknologi AI." },
          ].map((sdg, i) => (
            <motion.div key={sdg.tag} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${SDG_COLORS[sdg.tag]}`}>
                <sdg.icon size={20} className="text-white" />
              </div>
              <span className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-400">{sdg.tag}</span>
              <h3 className="mt-1 text-base font-bold">{sdg.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{sdg.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Feature -> SDG mapping table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 sm:px-5">Fitur</th>
                <th className="w-24 px-4 py-3 sm:w-28 sm:px-5">SDGs</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_SDG_MAP.map((row, i) => (
                <tr key={row.feature} className={i !== FEATURE_SDG_MAP.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700 sm:px-5">{row.feature}</td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold text-white ${SDG_COLORS[row.sdg]}`}>{row.sdg}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <StatCard icon={BadgeCheck} value="195+" label="Produk Lokal" delay={0.1} />
          <StatCard icon={ShieldCheck} value="100%" label="BPOM Verified" delay={0.16} />
          <StatCard icon={Database} value="9" label="Brand Lokal" delay={0.22} />
          <StatCard icon={Globe2} value="4" label="SDGs Didukung" delay={0.28} />
        </div>
      </section>

      {/* ===== MANFAAT ===== */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <SectionTitle eyebrow="Manfaat" title="Dampak untuk Berbagai Pihak" />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                <b.icon size={20} className="text-primary" />
              </div>
              <h3 className="mt-4 text-base font-bold">{b.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {b.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                    <Check size={14} className="mt-0.5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-6 text-sm text-slate-400 sm:flex-row">
          <span>&copy; 2026 SkinCheck &mdash; Proyek GEMASTIK</span>
          <span>Bukan pengganti konsultasi dokter kulit</span>
        </div>
      </footer>
    </div>
  );
}
