import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Loader2,
  Droplets, Sun, RotateCcw, MessageCircle, GitCompare, TriangleAlert, CircleCheck,
  Target, Brain, FileText, Trophy, Scale, Workflow, X,
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
  bpom_status: string;
  pregnancy_safe_status: string;
  skin_match_pct: number;
  ingredient_match_pct: number;
  synergy_pct: number;
  bpom_pct: number;
  total_pct: number;
  confidence_pct: number;
  matched_ingredients: string[];
  avoided_ingredients: string[];
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
  const [openingSummary, setOpeningSummary] = useState<string | null>(null);

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

      // Manfaatin sisa waktu loading buat minta Gemini bikin kalimat pembuka
      // -- fire-and-forget, nggak nge-block transisi ke Report. Kalau gagal
      // atau kelamaan, halaman Report tetap muncul normal tanpa kalimat ini.
      const bestForSummary = [...data].sort((a, b) => b.total_pct - a.total_pct)[0];
      if (bestForSummary) {
        fetch("/api/consultant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: "Buatkan kalimat sambutan pembuka singkat (maksimal 2 kalimat) yang ramah, merangkum bahwa rekomendasi sudah siap berdasarkan profil kulit pengguna. Jangan sebutkan angka skor secara eksplisit, cukup nada yang menenangkan dan meyakinkan.",
            user: { skin_type: skinType, concern: conditions },
            recommendation: { name: bestForSummary.title, brand: bestForSummary.brand, score: bestForSummary.total_pct },
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => { if (d?.answer) setOpeningSummary(d.answer); })
          .catch(() => {}); // diam-diam gagal aja, nggak ganggu alur utama
      }

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
    setOpeningSummary(null);
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
  const topPicks = CATEGORY_ORDER.filter((c) => byCategory[c]?.length).map((c) => byCategory[c][0]);
  // "Best" = 1 produk representatif (skor total tertinggi) -- Skin Match,
  // Confidence, dan Evidence yang ditampilkan SEMUA soal produk yang SAMA,
  // biar nggak ada kesan 2 angka yang saling bertentangan.
  const bestPick = topPicks.length
    ? [...topPicks].sort((x, y) => y.total_pct - x.total_pct)[0]
    : null;

  const isNextDisabled =
    (step === 0 && ageBracket === null) ||
    (step === 1 && skinType === null) ||
    (step === 3 && hamil === null);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
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
                      i <= step ? "bg-primary" : "bg-slate-200"
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
                    <h2 className="mb-5 text-xl font-extrabold text-ink">Berapa usiamu?</h2>
                    {AGE_BRACKETS.map((b) => (
                      <OptionButton key={b.label} selected={ageBracket === b.value} onClick={() => setAgeBracket(b.value)}>
                        {b.label}
                      </OptionButton>
                    ))}
                  </>
                )}
                {step === 1 && (
                  <>
                    <h2 className="mb-5 text-xl font-extrabold text-ink">
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
                    <h2 className="mb-1 text-xl font-extrabold text-ink">Apa target utamamu?</h2>
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
                    <h2 className="mb-5 text-xl font-extrabold text-ink">
                      Apakah kamu sedang hamil atau menyusui?
                    </h2>
                    <OptionButton selected={hamil === true} onClick={() => setHamil(true)}>Ya</OptionButton>
                    <OptionButton selected={hamil === false} onClick={() => setHamil(false)}>Tidak</OptionButton>
                  </>
                )}
                {step === 4 && (
                  <>
                    <h2 className="mb-1 text-xl font-extrabold text-ink">Budget maksimal per produk?</h2>
                    <p className="mb-4 text-sm text-slate-400">Opsional - kosongkan kalau nggak ada batasan</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                      <input
                        type="number"
                        placeholder="200"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-14 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
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
              className="mt-8 w-full gap-2 rounded-xl bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark disabled:opacity-40"
            >
              {step === totalQuestions - 1 ? "Analisis Sekarang" : "Lanjut"} <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {screen === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
            <p className="text-base font-bold text-ink">AI sedang menganalisis...</p>
            <div className="flex w-full flex-col gap-4">
              {ANALYSIS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3 transition-opacity duration-300" style={{ opacity: i < analysisIdx ? 1 : 0.3 }}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${i < analysisIdx ? "bg-success" : "bg-slate-200"}`}>
                    {i < analysisIdx && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-medium ${i < analysisIdx ? "text-ink" : "text-slate-400"}`}>{s}</span>
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
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-light"
                >
                  <Check size={26} className="text-success" strokeWidth={3} />
                </motion.div>
                <p className="text-center text-xs font-bold uppercase tracking-wide text-primary">Skin Report</p>
                <h2 className="mt-1 text-center text-2xl font-extrabold text-ink">Hasil analisis kulitmu</h2>

                <AnimatePresence>
                  {openingSummary && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mt-3 text-center text-sm leading-relaxed text-slate-500"
                    >
                      {openingSummary}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <ReportRow label="Tipe Kulit" value={skinType ?? "-"} />
                  <ReportRow label="Concern" value={conditions.length ? conditions.join(", ") : "Tidak ada spesifik"} />
                  <ReportRow label="Hamil / Menyusui" value={hamil ? "Ya" : "Tidak"} last />
                </div>

                {bestPick && (
                  <div className="mt-4 rounded-2xl bg-ink p-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Recommendation Summary</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Target size={12} />
                          <p className="text-[10px] font-semibold">Best Match</p>
                        </div>
                        <p className="mt-1 text-xl font-extrabold text-white">{bestPick.total_pct}%</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Brain size={12} />
                          <p className="text-[10px] font-semibold">Confidence</p>
                        </div>
                        <p className="mt-1 text-xl font-extrabold text-white">{bestPick.confidence_pct}%</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <FileText size={12} />
                          <p className="text-[10px] font-semibold">Evidence</p>
                        </div>
                        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          bestPick.evidence_tier === "L1" ? "bg-success/20 text-success"
                          : bestPick.evidence_tier === "L2" ? "bg-gold/20 text-gold"
                          : "bg-slate-500/20 text-slate-400"
                        }`}>
                          {bestPick.evidence_tier === "L1" ? "High" : bestPick.evidence_tier === "L2" ? "Medium" : "Limited"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 border-t border-slate-800 pt-2.5 text-[11px] leading-relaxed text-slate-500">
                      Berdasarkan <b className="text-slate-300">{bestPick.title}</b> ({bestPick.brand}) -- rekomendasi dengan skor tertinggi di routine kamu.
                    </p>
                  </div>
                )}

                <h3 className="mb-3 mt-7 text-base font-bold text-ink">Rekomendasi Routine-mu</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORY_ORDER.filter((c) => byCategory[c]?.length).map((cat) => (
                    <ProductCard
                      key={cat}
                      category={cat}
                      r={byCategory[cat][0]}
                      alternatives={byCategory[cat].slice(1)}
                      routineStep={CATEGORY_ORDER.indexOf(cat) + 1}
                      routineTotal={CATEGORY_ORDER.length}
                      userInput={{ skinType, conditions, hamil, budget }}
                    />
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
        selected ? "border-primary bg-primary-light text-primary-dark" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {children}
      <span
        className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center border ${multi ? "rounded-[6px]" : "rounded-full"} ${
          selected ? "border-primary bg-primary" : "border-slate-300 bg-transparent"
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
      <span className="max-w-[60%] text-right text-[13px] font-bold text-ink">{value}</span>
    </div>
  );
}

interface QA {
  q: string;
  getAnswer: (r: Recommendation, alternatives: Recommendation[], routineStep: number, routineTotal: number, category: string) => string;
}

// Semua jawaban disusun dari data Recommendation Engine (Knowledge Base + Explainable
// Engine) yang SUDAH ADA -- bukan LLM yang mikir/mengarang sendiri. Kalau nanti mau
// nambah LLM, posisinya cuma "menghaluskan bahasa" dari jawaban template ini, fakta di
// dalamnya tetap sama persis.
const SUGGESTED_QUESTIONS: QA[] = [
  {
    q: "Kenapa produk ini cocok?",
    getAnswer: (r) => r.explanation || "Belum ada data penjelasan lengkap untuk produk ini.",
  },
  {
    q: "Apa fungsi kandungannya?",
    getAnswer: (r) => {
      const lines = (r.explanation || "").split("\n").filter((l) => l.includes("Mengandung"));
      return lines.length ? lines.join("\n") : "Data kandungan aktif untuk produk ini belum lengkap di sistem kami.";
    },
  },
  {
    q: "Apakah aman untuk ibu hamil?",
    getAnswer: (r) => {
      if (r.pregnancy_safe_status === "aman")
        return "Ya, berdasarkan data kami produk ini tergolong aman digunakan selama kehamilan/menyusui. Tetap disarankan konsultasi ke dokter untuk memastikan.";
      if (r.pregnancy_safe_status === "perlu_konsultasi")
        return "Produk ini mengandung bahan yang tergolong perlu kehati-hatian saat hamil/menyusui. Sebaiknya konsultasikan ke dokter dulu sebelum pemakaian.";
      if (r.pregnancy_safe_status === "tidak_aman")
        return "Produk ini TIDAK disarankan untuk ibu hamil/menyusui karena mengandung bahan aktif yang berisiko. Coba cek alternatif lain di kategori yang sama.";
      return "Status keamanan kehamilan untuk produk ini belum kami verifikasi.";
    },
  },
  {
    q: "Bagaimana urutan pemakaian?",
    getAnswer: (_r, _alt, step, total, category) =>
      `${category} adalah langkah ke-${step} dari ${total} dalam routine (urutan: Cleanser \u2192 Toner \u2192 Serum \u2192 Moisturizer \u2192 Sunscreen). Gunakan pagi & malam sesuai urutan ini -- khusus Sunscreen hanya di pagi hari.`,
  },
  {
    q: "Apa alternatif yang lebih murah?",
    getAnswer: (r, alternatives) => {
      const cheaper = alternatives
        .filter((a) => a.price_idr && r.price_idr && a.price_idr < r.price_idr)
        .sort((a, b) => (a.price_idr ?? 0) - (b.price_idr ?? 0))[0];
      if (cheaper) {
        const priceStr = cheaper.price_idr ? `Rp${cheaper.price_idr.toLocaleString("id-ID")}` : "harga tidak tersedia";
        return `Ada: ${cheaper.title} (${cheaper.brand}) seharga ${priceStr}, skor kecocokan ${cheaper.total_pct}%. Lebih murah, tapi cek dulu skornya masih sesuai kebutuhanmu.`;
      }
      return "Berdasarkan hasil rekomendasi saat ini, belum ada alternatif harga lebih murah dengan skor sebanding. Produk ini sudah pilihan terbaik di rentang budget kamu.";
    },
  },
];

function ProductCard({
  category, r, alternatives, routineStep, routineTotal, userInput,
}: {
  category: string;
  r: Recommendation;
  alternatives: Recommendation[];
  routineStep: number;
  routineTotal: number;
  userInput: { skinType: string | null; conditions: string[]; hamil: boolean | null; budget: string };
}) {
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [consultantOpen, setConsultantOpen] = useState(false);
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [llmAnswer, setLlmAnswer] = useState<string | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [compareWith, setCompareWith] = useState<Recommendation | null>(null);
  const Icon = category === "Sunscreen" ? Sun : Droplets;
  let badge = { label: "Alternative", bg: "bg-orange-50", fg: "text-orange-700" };
  if (r.total_pct >= 90) badge = { label: "Highly Recommended", bg: "bg-success-light", fg: "text-success" };
  else if (r.total_pct >= 75) badge = { label: "Good Match", bg: "bg-warning-light", fg: "text-warning" };

  async function askQuestion(q: string) {
    if (activeQ === q) {
      setActiveQ(null);
      return;
    }
    setActiveQ(q);
    setLlmAnswer(null);
    setUsedFallback(false);
    setIsLoadingAnswer(true);

    const templateAnswer = SUGGESTED_QUESTIONS.find((sq) => sq.q === q)?.getAnswer(r, alternatives, routineStep, routineTotal, category) ?? "";

    try {
      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          recommendation: { name: r.title, brand: r.brand, category, score: r.total_pct },
          comparison: alternatives.length > 0 ? { name: alternatives[0].title, brand: alternatives[0].brand, score: alternatives[0].total_pct } : null,
          evidence: { matched_ingredients: r.matched_ingredients, avoided_ingredients: r.avoided_ingredients, evidence_level: r.evidence_level },
          confidence: r.confidence_pct,
          constraints: { pregnancy_status: r.pregnancy_safe_status, price_idr: r.price_idr, bpom_status: r.bpom_status },
          routine: { category, step_ke: routineStep, total_langkah: routineTotal, urutan_kategori: "Cleanser, Toner, Serum, Moisturizer, Sunscreen" },
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setLlmAnswer(data.answer || templateAnswer);
      if (!data.answer) setUsedFallback(true);
    } catch {
      // LLM gagal (offline, quota, dsb) -- fallback ke jawaban template biar demo tetap jalan
      setLlmAnswer(templateAnswer);
      setUsedFallback(true);
    } finally {
      setIsLoadingAnswer(false);
    }
  }


  return (
    <motion.div whileHover={{ y: -3, boxShadow: "0 8px 20px rgba(15,23,42,0.08)" }} transition={{ duration: 0.2 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={16} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{category}</p>
          <p className="truncate text-sm font-bold text-ink">{r.title}</p>
          <p className="text-xs text-slate-500">{r.brand}</p>
        </div>
        <p className="shrink-0 text-lg font-extrabold text-primary">{r.total_pct}%</p>
      </div>
      <Badge className={`mt-2.5 rounded-full ${badge.bg} ${badge.fg}`}>{badge.label}</Badge>

      {alternatives.length > 0 && (
        <button
          onClick={() => setCompareWith(compareWith ? null : alternatives[0])}
          className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-600"
        >
          <GitCompare size={13} /> {compareWith ? "Tutup perbandingan" : "Bandingkan Produk"}
        </button>
      )}

      <AnimatePresence>
        {compareWith && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ComparePanel
              a={r}
              b={compareWith}
              alternatives={alternatives}
              onChangeB={setCompareWith}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setDecisionOpen(true)}
        className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-600"
      >
        <Workflow size={13} /> Lihat Proses Keputusan AI
      </button>

      <AnimatePresence>
        {decisionOpen && (
          <DecisionProcessDrawer r={r} userInput={userInput} onClose={() => setDecisionOpen(false)} />
        )}
      </AnimatePresence>

      <button
        onClick={() => { setConsultantOpen(!consultantOpen); setActiveQ(null); }}
        className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-primary"
      >
        <MessageCircle size={13} /> {consultantOpen ? "Tutup AI Skin Consultant" : "Tanya AI Skin Consultant"}
      </button>

      <AnimatePresence>
        {consultantOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
              {SUGGESTED_QUESTIONS.map((sq) => (
                <button
                  key={sq.q}
                  onClick={() => askQuestion(sq.q)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    activeQ === sq.q ? "border-primary bg-primary-light text-primary-dark" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {sq.q}
                </button>
              ))}
            </div>

            {isLoadingAnswer && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                <Loader2 size={13} className="animate-spin text-primary" />
                <p className="text-xs text-slate-500">Menyusun jawaban...</p>
              </div>
            )}

            <AnimatePresence>
              {llmAnswer && !isLoadingAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2.5 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                    <TypewriterText text={llmAnswer} />
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                    {usedFallback ? "Jawaban dari sistem (mode offline)" : "Powered by Gemini"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Compare + AI Verdict + Why Not, dalam satu panel.
 * Semua angka & alasan diambil langsung dari komponen skor Recommendation
 * Engine v6 (skin_match, ingredient_match, synergy, bpom) -- bukan dihitung
 * ulang atau dikarang di frontend. AI Verdict menjelaskan KENAPA (faktor
 * dominan), Why Not menjelaskan TRADE-OFF -- dua fungsi yang sengaja dibedakan.
 */
function ComparePanel({
  a, b, alternatives, onChangeB,
}: {
  a: Recommendation;
  b: Recommendation;
  alternatives: Recommendation[];
  onChangeB: (r: Recommendation) => void;
}) {
  const isTotalTie = a.total_pct === b.total_pct;
  const isFullyIdentical =
    isTotalTie &&
    a.skin_match_pct === b.skin_match_pct &&
    a.ingredient_match_pct === b.ingredient_match_pct &&
    a.synergy_pct === b.synergy_pct &&
    a.bpom_pct === b.bpom_pct;

  // Kalau total skor seri, tie-break pakai Skin Match (kriteria utama kami).
  let winner = a;
  let loser = b;
  if (isTotalTie) {
    winner = a.skin_match_pct >= b.skin_match_pct ? a : b;
  } else {
    winner = a.total_pct >= b.total_pct ? a : b;
  }
  loser = winner.id === a.id ? b : a;
  const wonByTieBreak = isTotalTie && !isFullyIdentical;

  const rows = [
    { label: "Skin Match", av: a.skin_match_pct, bv: b.skin_match_pct, max: 40 },
    { label: "Ingredient Match", av: a.ingredient_match_pct, bv: b.ingredient_match_pct, max: 30 },
    { label: "Synergy", av: a.synergy_pct, bv: b.synergy_pct, max: 10 },
    { label: "BPOM", av: a.bpom_pct, bv: b.bpom_pct, max: 10 },
    { label: "Total Score", av: a.total_pct, bv: b.total_pct, max: 100 },
  ];

  // Faktor yang bikin winner unggul, diurutkan dari selisih poin terbesar.
  const factorDiffs = [
    { label: "Skin Match", diff: winner.skin_match_pct - loser.skin_match_pct },
    { label: "Ingredient Match", diff: winner.ingredient_match_pct - loser.ingredient_match_pct },
    { label: "Synergy", diff: winner.synergy_pct - loser.synergy_pct },
    { label: "BPOM", diff: winner.bpom_pct - loser.bpom_pct },
  ].filter((f) => f.diff > 0).sort((x, y) => y.diff - x.diff);

  // === AI Verdict: menjelaskan KENAPA, bukan cuma ngulang skor ===
  let verdictText: string;
  if (isFullyIdentical) {
    verdictText = `Kedua produk memiliki skor akhir yang sama persis di semua komponen. Keduanya sama-sama direkomendasikan -- silakan pilih berdasarkan preferensi harga atau tekstur.`;
  } else if (wonByTieBreak) {
    verdictText = `${winner.title} dan ${loser.title} memperoleh skor total yang setara (${winner.total_pct}%). Sistem memprioritaskan ${winner.title} karena unggul pada Skin Match, kriteria utama dalam rekomendasi kami.`;
  } else if (factorDiffs.length >= 2) {
    verdictText = `${winner.title} dipilih sebagai rekomendasi utama karena memberikan keseimbangan lebih baik antara ${factorDiffs[0].label.toLowerCase()} dan ${factorDiffs[1].label.toLowerCase()} dibanding ${loser.title}, sambil tetap memenuhi seluruh syarat keamanan (BPOM, budget, dan kehamilan).`;
  } else if (factorDiffs.length === 1) {
    verdictText = `${winner.title} dipilih karena unggul pada ${factorDiffs[0].label.toLowerCase()} dibanding ${loser.title}, dengan seluruh syarat keamanan (BPOM, budget, kehamilan) tetap terpenuhi di kedua produk.`;
  } else {
    verdictText = `${winner.title} dipilih karena skor totalnya sedikit lebih tinggi secara keseluruhan (${winner.total_pct}% vs ${loser.total_pct}%).`;
  }

  // === Why Not: menjelaskan TRADE-OFF, bukan cuma "skor lebih rendah" ===
  const tradeoffs: string[] = [];
  if (loser.price_idr && winner.price_idr && loser.price_idr > winner.price_idr) {
    tradeoffs.push(`Harga sedikit lebih tinggi: Rp${loser.price_idr.toLocaleString("id-ID")} vs Rp${winner.price_idr.toLocaleString("id-ID")}`);
  }
  if (loser.avoided_ingredients.length > 0) {
    tradeoffs.push(`Mengandung ${loser.avoided_ingredients.join(", ")} yang perlu dihindari sesuai profil kamu`);
  }
  factorDiffs.forEach((f) => {
    tradeoffs.push(`${f.label} lebih rendah terhadap profil kamu (-${f.diff} poin)`);
  });
  if (loser.pregnancy_safe_status === "tidak_aman" && winner.pregnancy_safe_status !== "tidak_aman") {
    tradeoffs.push("Tidak aman untuk kehamilan/menyusui berdasarkan data kami");
  }
  if (!isFullyIdentical && !isTotalTie) {
    tradeoffs.push(`Total skor akhir ${winner.total_pct - loser.total_pct} poin di bawah rekomendasi utama`);
  }

  // Decision Factors: ringkasan visual kekuatan produk pemenang.
  const pips = (val: number, max: number) => Math.max(1, Math.round((val / max) * 5));
  const pregnancyLabel =
    winner.pregnancy_safe_status === "aman" ? "Aman"
    : winner.pregnancy_safe_status === "perlu_konsultasi" ? "Perlu Konsultasi"
    : winner.pregnancy_safe_status === "tidak_aman" ? "Tidak Aman"
    : "Belum Diketahui";

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      {alternatives.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              onClick={() => onChangeB(alt)}
              className={`rounded-xl px-2.5 py-1.5 text-left text-[11px] font-semibold leading-snug transition-colors ${
                alt.id === b.id ? "bg-ink text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              {alt.title}
            </button>
          ))}
        </div>
      )}

      {/* Badge pemenang vs alternatif */}
      <div className="grid grid-cols-2 gap-2">
        {[a, b].map((p) => {
          const isWinner = p.id === winner.id && !isFullyIdentical;
          return (
            <div key={p.id} className={`rounded-lg px-2.5 py-2 text-center ${isWinner ? "bg-success-light" : "bg-white border border-slate-200"}`}>
              <p className={`flex items-center justify-center gap-1 text-[10px] font-bold ${isWinner ? "text-success" : "text-slate-500"}`}>
                {isFullyIdentical ? <Scale size={11} /> : isWinner ? <Trophy size={11} /> : <TriangleAlert size={11} />}
                {isFullyIdentical ? "Setara" : isWinner ? "Recommended" : "Alternative"}
              </p>
              <p className="line-clamp-2 text-xs font-bold leading-snug text-ink">{p.title}</p>
              <p className="truncate text-[10px] text-slate-400">{p.brand}</p>
              <p className="text-[10px] text-slate-400">
                {isWinner ? `Confidence ${p.confidence_pct}%` : `Overall Score ${p.total_pct}%`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 items-center gap-2 text-center">
        <p className="line-clamp-2 text-xs font-bold leading-snug text-ink">{a.title}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">vs</p>
        <p className="line-clamp-2 text-xs font-bold leading-snug text-ink">{b.title}</p>
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-3 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, (row.av / row.max) * 100)}%` }} />
              </div>
              <span className="w-8 text-right text-[11px] font-bold text-slate-700">{row.av}</span>
            </div>
            <p className="text-center text-[10px] font-medium text-slate-400">{row.label}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-8 text-left text-[11px] font-bold text-slate-700">{row.bv}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="ml-auto h-full rounded-full bg-slate-500" style={{ width: `${Math.max(0, (row.bv / row.max) * 100)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Decision Factors -- ringkasan kekuatan produk pemenang */}
      {!isFullyIdentical && (
        <div className="mt-3.5 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-bold text-slate-700">Decision Factors -- {winner.title}</p>
          <div className="mt-1.5 flex flex-col gap-1">
            {[
              { label: "Skin Match", pip: pips(winner.skin_match_pct, 40) },
              { label: "Ingredient", pip: pips(winner.ingredient_match_pct, 30) },
              { label: "Synergy", pip: pips(Math.max(winner.synergy_pct, 0), 10) },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{f.label}</span>
                <span className="text-[11px] font-bold text-primary">{"+".repeat(f.pip)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">BPOM</span>
              <Check size={12} className="text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Budget</span>
              <Check size={12} className="text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Pregnancy</span>
              <span className="text-[11px] font-semibold text-slate-600">{pregnancyLabel}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3.5 rounded-lg bg-success-light p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleCheck size={15} className="shrink-0 text-success" />
            <p className="text-[11px] font-bold text-success">AI Verdict</p>
          </div>
          <span className="text-[10px] font-bold text-success">Confidence {winner.confidence_pct}%</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-success">{verdictText}</p>
      </div>

      {!isFullyIdentical && tradeoffs.length > 0 && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-warning-light p-3">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="text-[11px] font-bold text-warning">Mengapa bukan {loser.title}?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-warning">
              {loser.title} tetap merupakan alternatif yang baik, namun belum menjadi pilihan utama karena:
            </p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {tradeoffs.map((t) => (
                <li key={t} className="text-xs leading-relaxed text-warning">&bull; {t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/** Efek teks muncul kayak diketik -- bikin jawaban LLM kerasa "hidup", bukan dump teks langsung. */
function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const interval = setInterval(() => {
      i += 2; // 2 karakter per tick biar nggak kelamaan buat jawaban panjang
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <>{shown}</>;
}

/**
 * AI Decision Process -- drawer yang nunjukin pipeline keputusan sesungguhnya,
 * pakai angka ASLI dari hasil Recommendation Engine v6 (bukan animasi generik
 * kayak loading screen). Tiap tahap muncul berurutan biar kerasa alurnya.
 */
function DecisionProcessDrawer({
  r, userInput, onClose,
}: {
  r: Recommendation;
  userInput: { skinType: string | null; conditions: string[]; hamil: boolean | null; budget: string };
  onClose: () => void;
}) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const steps = [
    {
      title: "Input",
      content: (
        <div className="flex flex-col gap-1 text-xs text-slate-600">
          <p>Tipe Kulit: <b>{userInput.skinType ?? "-"}</b></p>
          <p>Concern: <b>{userInput.conditions.length ? userInput.conditions.join(", ") : "Tidak ada spesifik"}</b></p>
          <p>Budget: <b>{userInput.budget ? `Rp${parseInt(userInput.budget, 10).toLocaleString("id-ID")}rb` : "Tidak dibatasi"}</b></p>
          <p>Hamil/Menyusui: <b>{userInput.hamil ? "Ya" : "Tidak"}</b></p>
        </div>
      ),
    },
    {
      title: "Constraint Engine",
      content: <p className="text-xs text-slate-600">Produk ini lolos semua syarat wajib: <b className="text-success">BPOM terdaftar, sesuai budget, aman untuk profil kehamilan kamu.</b></p>,
    },
    {
      title: "Evidence-Aware Engine",
      content: (
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            r.evidence_tier === "L1" ? "bg-success-light text-success" : r.evidence_tier === "L2" ? "bg-warning-light text-warning" : "bg-slate-100 text-slate-500"
          }`}>
            {r.evidence_tier === "L1" ? "High" : r.evidence_tier === "L2" ? "Medium" : "Limited"}
          </span>
          <span className="text-xs text-slate-500">({r.evidence_level})</span>
        </div>
      ),
    },
    {
      title: "Synergy Check",
      content: <p className="text-xs text-slate-600">Skor sinergi kandungan: <b className={r.synergy_pct >= 0 ? "text-success" : "text-warning"}>{r.synergy_pct > 0 ? `+${r.synergy_pct}` : r.synergy_pct}</b></p>,
    },
    {
      title: "Ranking",
      content: <p className="text-xl font-extrabold text-primary">{r.total_pct}%</p>,
    },
    {
      title: "Recommendation",
      content: <p className="text-sm font-bold text-ink">{r.title} <span className="font-normal text-slate-500">({r.brand})</span></p>,
    },
  ];

  useEffect(() => {
    setVisibleSteps(0);
    const interval = setInterval(() => {
      setVisibleSteps((v) => {
        if (v >= steps.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, 450);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">Proses Keputusan AI</h3>
          <button onClick={onClose} className="text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <AnimatePresence key={step.title}>
              {i < visibleSteps && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{step.title}</p>
                  </div>
                  <div className="ml-7 mt-1.5 rounded-lg bg-slate-50 p-3">{step.content}</div>
                  {i < steps.length - 1 && <div className="ml-2.5 mt-1.5 h-3 w-px bg-slate-200" />}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
