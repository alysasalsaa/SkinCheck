import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Loader2,
  Droplets, Sun, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SUPABASE_URL = "https://ncdbcxhnkpzgmoioxskg.supabase.co";
const SUPABASE_KEY = "sb_publishable_WjZblozn_J7IhWpOWJ2MLw_ApxuFN2w";

const SKIN_TYPES = ["Berminyak", "Kering", "Normal", "Sensitif", "Kombinasi", "Rawan Jerawat"];
const CONDITIONS = [
  "Jerawat Aktif", "Bekas Jerawat / Noda Hitam", "Kulit Kusam",
  "Dehidrasi", "Kemerahan / Iritasi", "Pori Besar", "Tanda Penuaan",
];
const AGE_BRACKETS = [
  { label: "< 18 tahun", value: 16 },
  { label: "18 - 25 tahun", value: 21 },
  { label: "26 - 35 tahun", value: 30 },
  { label: "35+ tahun", value: 40 },
];
const CATEGORY_ORDER = ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen"];
const ANALYSIS_STEPS = [
  "Menentukan tipe kulit",
  "Mencocokkan kandungan aktif",
  "Memeriksa status BPOM",
  "Menghitung compatibility",
  "Menyusun rekomendasi",
];

interface Recommendation {
  id: string;
  brand: string;
  title: string;
  category: string;
  price_idr: number | null;
  pregnancy_safe_status: string;
  total_pct: number;
  confidence_pct: number;
  evidence_tier: "L1" | "L2" | "L3";
  evidence_level: string;
  explanation: string;
}

type Screen = "wizard" | "loading" | "report";

export default function Assessment() {
  const [screen, setScreen] = useState<Screen>("wizard");
  const [step, setStep] = useState(0);
  const [ageBracket, setAgeBracket] = useState<number | null>(null);
  const [skinType, setSkinType] = useState<string | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [hamil, setHamil] = useState<boolean | null>(null);
  const [budget, setBudget] = useState("");
  const [analysisIdx, setAnalysisIdx] = useState(0);
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = 5;

  function toggleCondition(c: string) {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function goNext() {
    if (step < totalQuestions - 1) setStep(step + 1);
    else runAnalysis();
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  async function runAnalysis() {
    setScreen("loading");
    setAnalysisIdx(0);
    setError(null);

    const anim = setInterval(() => {
      setAnalysisIdx((i) => Math.min(i + 1, ANALYSIS_STEPS.length));
    }, 460);

    const started = Date.now();
    try {
      const budgetVal = budget ? parseInt(budget, 10) * 1000 : null;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_skincare_recommendations_v6`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_skin_types: skinType ? [skinType] : [],
          p_age: ageBracket,
          p_hamil: hamil === true,
          p_conditions: conditions,
          p_budget: budgetVal,
          p_limit_per_category: 3,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");
      const data: Recommendation[] = await res.json();

      const elapsed = Date.now() - started;
      const minWait = Math.max(0, 2300 - elapsed);
      setTimeout(() => {
        clearInterval(anim);
        setResults(data);
        setScreen("report");
      }, minWait);
    } catch (e) {
      clearInterval(anim);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      setTimeout(() => setScreen("report"), 600);
    }
  }

  function resetAll() {
    setScreen("wizard");
    setStep(0);
    setAgeBracket(null);
    setSkinType(null);
    setConditions([]);
    setHamil(null);
    setBudget("");
    setResults(null);
    setError(null);
  }

  const byCategory: Record<string, Recommendation[]> = {};
  if (results) {
    for (const r of results) {
      const cat = r.category || "Lainnya";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(r);
    }
    Object.values(byCategory).forEach((arr) => arr.sort((a, b) => b.total_pct - a.total_pct));
  }
  const topResult = results && results.length > 0
    ? [...results].sort((a, b) => b.confidence_pct - a.confidence_pct)[0]
    : null;

  const isNextDisabled =
    (step === 0 && ageBracket === null) ||
    (step === 1 && skinType === null) ||
    (step === 3 && hamil === null);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6">
        {screen === "wizard" && (
          <div className="flex flex-1 flex-col py-10">
            <div className="mb-8 flex items-center gap-4">
              {step === 0 ? (
                <Link to="/">
                  <button className="text-slate-400 hover:text-slate-600">
                    <ArrowLeft size={20} />
                  </button>
                </Link>
              ) : (
                <button onClick={goBack} className="text-slate-400 hover:text-slate-600">
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex flex-1 gap-1.5">
                {Array.from({ length: totalQuestions }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mb-6 text-xs font-semibold text-slate-400">
              Pertanyaan {step + 1} dari {totalQuestions}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col gap-3"
              >
                {step === 0 && (
                  <>
                    <h2 className="mb-5 text-xl font-extrabold text-slate-900">Berapa usiamu?</h2>
                    {AGE_BRACKETS.map((b) => (
                      <OptionButton key={b.label} selected={ageBracket === b.value} onClick={() => setAgeBracket(b.value)}>
                        {b.label}
                      </OptionButton>
                    ))}
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2 className="mb-5 text-xl font-extrabold text-slate-900">
                      Bagaimana kondisi wajahmu 30 menit setelah cuci muka?
                    </h2>
                    {SKIN_TYPES.map((t) => (
                      <OptionButton key={t} selected={skinType === t} onClick={() => setSkinType(t)}>
                        {t}
                      </OptionButton>
                    ))}
                  </>
                )}
                {step === 2 && (
                  <>
                    <h2 className="mb-1 text-xl font-extrabold text-slate-900">Apa target utamamu?</h2>
                    <p className="mb-4 text-sm text-slate-400">Boleh pilih lebih dari satu</p>
                    {CONDITIONS.map((c) => (
                      <OptionButton key={c} selected={conditions.includes(c)} onClick={() => toggleCondition(c)} multi>
                        {c}
                      </OptionButton>
                    ))}
                  </>
                )}
                {step === 3 && (
                  <>
                    <h2 className="mb-5 text-xl font-extrabold text-slate-900">
                      Apakah kamu sedang hamil atau menyusui?
                    </h2>
                    <OptionButton selected={hamil === true} onClick={() => setHamil(true)}>Ya</OptionButton>
                    <OptionButton selected={hamil === false} onClick={() => setHamil(false)}>Tidak</OptionButton>
                  </>
                )}
                {step === 4 && (
                  <>
                    <h2 className="mb-1 text-xl font-extrabold text-slate-900">Budget maksimal per produk?</h2>
                    <p className="mb-4 text-sm text-slate-400">Opsional - kosongkan kalau nggak ada batasan</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                      <input
                        type="number"
                        placeholder="200"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-14 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">ribu</span>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex-1" />

            <Button
              onClick={goNext}
              disabled={isNextDisabled}
              size="lg"
              className="mt-8 w-full gap-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-40"
            >
              {step === totalQuestions - 1 ? "Analisis Sekarang" : "Lanjut"} <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {screen === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
            <p className="text-base font-bold text-slate-900">AI sedang menganalisis...</p>
            <div className="flex w-full flex-col gap-4">
              {ANALYSIS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3 transition-opacity duration-300" style={{ opacity: i < analysisIdx ? 1 : 0.3 }}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${i < analysisIdx ? "bg-emerald-500" : "bg-slate-200"}`}>
                    {i < analysisIdx && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-medium ${i < analysisIdx ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === "report" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-1 flex-col py-10">
            {error ? (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error} Coba lagi sebentar lagi ya.</div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Skin Report</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Hasil analisis kulitmu</h2>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <ReportRow label="Tipe Kulit" value={skinType ?? "-"} />
                  <ReportRow label="Concern" value={conditions.length ? conditions.join(", ") : "Tidak ada spesifik"} />
                  <ReportRow label="Hamil / Menyusui" value={hamil ? "Ya" : "Tidak"} last />
                </div>

                {topResult && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 p-5">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">AI Confidence</p>
                      <p className="text-2xl font-extrabold text-white">{topResult.confidence_pct}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400">Evidence</p>
                      <p className="text-amber-400">
                        {"\u2605".repeat(topResult.evidence_tier === "L1" ? 5 : topResult.evidence_tier === "L2" ? 4 : 2)}
                        <span className="text-slate-600">{"\u2605".repeat(5 - (topResult.evidence_tier === "L1" ? 5 : topResult.evidence_tier === "L2" ? 4 : 2))}</span>
                      </p>
                    </div>
                  </div>
                )}

                <h3 className="mb-3 mt-7 text-base font-bold text-slate-900">Rekomendasi Routine-mu</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORY_ORDER.filter((c) => byCategory[c]?.length).map((cat) => (
                    <ProductCard key={cat} category={cat} r={byCategory[cat][0]} />
                  ))}
                  {!results?.length && (
                    <p className="py-8 text-center text-sm text-slate-400">
                      Belum ada produk yang cocok persis. Coba longgarkan budget atau kondisi kulit.
                    </p>
                  )}
                </div>
              </>
            )}

            <Button onClick={resetAll} variant="outline" className="mt-8 w-full gap-2 rounded-xl border-slate-300">
              <RotateCcw size={15} /> Mulai Ulang Analisis
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OptionButton({ children, selected, onClick, multi }: { children: React.ReactNode; selected: boolean; onClick: () => void; multi?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${
        selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {children}
      <span
        className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center border ${multi ? "rounded-[6px]" : "rounded-full"} ${
          selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-transparent"
        }`}
      >
        {selected && <Check size={12} className="text-white" strokeWidth={3} />}
      </span>
    </button>
  );
}

function ReportRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between py-2.5 ${last ? "" : "border-b border-slate-100"}`}>
      <span className="text-[13px] font-medium text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-[13px] font-bold text-slate-900">{value}</span>
    </div>
  );
}

function ProductCard({ category, r }: { category: string; r: Recommendation }) {
  const [open, setOpen] = useState(false);
  const Icon = category === "Sunscreen" ? Sun : Droplets;
  let badge = { label: "Alternative", bg: "bg-orange-50", fg: "text-orange-700" };
  if (r.total_pct >= 90) badge = { label: "Highly Recommended", bg: "bg-emerald-50", fg: "text-emerald-700" };
  else if (r.total_pct >= 75) badge = { label: "Good Match", bg: "bg-amber-50", fg: "text-amber-700" };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={16} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{category}</p>
          <p className="truncate text-sm font-bold text-slate-900">{r.title}</p>
          <p className="text-xs text-slate-500">{r.brand}</p>
        </div>
        <p className="shrink-0 text-lg font-extrabold text-blue-600">{r.total_pct}%</p>
      </div>
      <Badge className={`mt-2.5 rounded-full ${badge.bg} ${badge.fg}`}>{badge.label}</Badge>
      <button onClick={() => setOpen(!open)} className="mt-2.5 flex items-center gap-1 text-xs font-bold text-blue-600">
        <Sparkles size={12} /> {open ? "Sembunyikan alasan" : "Mengapa direkomendasikan?"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="mt-2.5 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {r.explanation || "Belum ada penjelasan detail untuk produk ini."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
