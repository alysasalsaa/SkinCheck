import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ShieldCheck, BadgeCheck, ArrowRight, Database,
  Eye, MessageSquareText, Droplets, Target, FlaskConical,
  Wallet, HeartPulse, ClipboardCheck, ClipboardList, BrainCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "@/components/SectionTitle";
import { StatCard } from "@/components/StatCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Stepper } from "@/components/Stepper";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section className="relative">
        {/* Background: mesh gradient tipis, bukan putih polos */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-blue-400/20 blur-[100px]" />
          <div className="absolute top-20 -right-24 h-[380px] w-[380px] rounded-full bg-emerald-400/15 blur-[100px]" />
        </div>

        <nav className="relative mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-sm tracking-tight">SkinMatch AI</span>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-600">Cara Kerja</Button>
        </nav>

        <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 px-6 pb-24 pt-8 md:grid-cols-2 md:pt-16">
          {/* Kiri: copy + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start gap-6"
          >
            <Badge className="gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-50">
              <Sparkles size={13} /> Powered by Explainable AI
            </Badge>

            <h1 className="text-[2.25rem] md:text-[3rem] font-extrabold leading-[1.1] tracking-tight text-slate-900">
              Temukan Skincare Lokal<br />yang Tepat untuk Kulitmu
            </h1>

            <p className="max-w-md text-base leading-relaxed text-slate-500">
              AI Recommendation berbasis kandungan aktif dan data BPOM &mdash;
              bukan sekadar tren media sosial.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => navigate("/assessment")} size="lg" className="gap-2 rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02] hover:bg-blue-700">
                Mulai Analisis <ArrowRight size={16} />
              </Button>
              <Button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} size="lg" variant="outline" className="rounded-xl border-slate-300 px-6 text-slate-700 transition-transform hover:scale-[1.02]">
                Lihat Cara Kerja
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatCard icon={BadgeCheck} value="195+" label="Produk Lokal" delay={0.1} />
              <StatCard icon={ShieldCheck} value="100%" label="BPOM Verified" delay={0.18} />
              <StatCard icon={Database} value="9" label="Brand Lokal" delay={0.26} />
              <StatCard icon={FlaskConical} value="33+" label="Kandungan Aktif" delay={0.34} />
            </div>
          </motion.div>

          {/* Kanan: Glass card hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_20px_60px_rgba(59,130,246,0.15)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Skin Report</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldCheck size={14} className="text-emerald-600" />
                </span>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-extrabold text-blue-600">95%</span>
                <span className="mb-1.5 text-sm font-medium text-slate-500">Skin Match</span>
              </div>

              <div className="mt-1 flex items-center gap-1 text-amber-500">
                {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                <span className="ml-1 text-xs font-medium text-slate-400">Evidence Level</span>
              </div>

              <div className="mt-5 h-px w-full bg-slate-200" />

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">AI Confidence</p>
                  <p className="text-xl font-bold text-slate-900">94%</p>
                </div>
                <Badge className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  Routine Ready
                </Badge>
              </div>
            </motion.div>

            {/* floating mini card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-8 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
            >
              <FlaskConical size={16} className="text-blue-600" />
              <div>
                <p className="text-[11px] text-slate-400 leading-none">Ingredient Matched</p>
                <p className="text-sm font-bold leading-none mt-1">Niacinamide + Ceramide</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= WHY DIFFERENT ================= */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <SectionTitle
          eyebrow="Kenapa Berbeda"
          title="Mengapa AI Kami Berbeda"
          subtitle="Bukan sekadar chatbot yang menjawab pertanyaan &mdash; ini sistem yang benar-benar menganalisis sebelum merekomendasikan."
        />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          <FeatureCard
            index={0}
            icon={Database}
            title="Knowledge Base"
            description="195 produk skincare lokal, kandungan aktif, dan status BPOM terverifikasi — bukan data yang diketik asal."
          />
          <FeatureCard
            index={1}
            icon={Eye}
            title="Evidence-Aware AI"
            description="Tiap rekomendasi punya Evidence Level — transparan soal seberapa kuat data di baliknya, bukan menyembunyikan ketidakpastian."
          />
          <FeatureCard
            index={2}
            icon={MessageSquareText}
            title="Explainable Recommendation"
            description="Bukan cuma daftar produk. Sistem menjelaskan kandungan apa yang cocok dan kenapa, dalam bahasa yang mudah dipahami."
          />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <SectionTitle
          eyebrow="Prosesnya"
          title="Bagaimana Cara Kerjanya"
          subtitle="Empat langkah, dari profil kulitmu sampai rekomendasi yang bisa dijelaskan alasannya."
        />
        <div className="mt-12">
          <Stepper
            steps={[
              { icon: ClipboardList, title: "Skin Assessment", description: "Jawab beberapa pertanyaan singkat soal kulit, kondisi, dan kebutuhanmu." },
              { icon: BrainCog, title: "AI Analysis", description: "Sistem mencocokkan profilmu dengan kandungan, keamanan, dan budget." },
              { icon: Target, title: "Recommendation", description: "Routine skincare tersusun per kategori, diurutkan berdasarkan skor kecocokan." },
              { icon: MessageSquareText, title: "Explainable Result", description: "Tiap produk disertai alasan konkret kenapa direkomendasikan untukmu." },
            ]}
          />
        </div>
      </section>

      {/* ================= WHAT WE ANALYZE ================= */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
        <SectionTitle
          eyebrow="Data yang Dipakai"
          title="Yang Dianalisis AI"
          subtitle="Setiap rekomendasi mempertimbangkan lebih dari sekadar nama produk."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { icon: Droplets, label: "Tipe Kulit" },
            { icon: Target, label: "Concern / Masalah Kulit" },
            { icon: FlaskConical, label: "Kandungan Aktif" },
            { icon: Wallet, label: "Budget" },
            { icon: HeartPulse, label: "Status Kehamilan" },
            { icon: ClipboardCheck, label: "Status BPOM" },
          ].map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Icon size={18} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= CTA PENUTUP ================= */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Siap tahu skincare yang cocok buat kamu?</h2>
          <p className="max-w-md text-slate-500">Sekitar 1 menit, langsung dapat rekomendasi lengkap dengan alasannya.</p>
          <Button onClick={() => navigate("/assessment")} size="lg" className="gap-2 rounded-xl bg-blue-600 px-7 text-white shadow-md shadow-blue-600/20 transition-transform hover:scale-[1.02] hover:bg-blue-700">
            Mulai Analisis Gratis <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-6 text-sm text-slate-400 sm:flex-row">
          <span>&copy; 2026 SkinMatch AI &mdash; Proyek GEMASTIK</span>
          <span>Bukan pengganti konsultasi dokter kulit</span>
        </div>
      </footer>
    </div>
  );
}
