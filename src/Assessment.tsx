import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Loader2,
  Droplets, Sun, RotateCcw, MessageCircle, GitCompare, TriangleAlert, CircleCheck,
  Target, Brain, FileText, Trophy, Scale,
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

                {bestPick && (
                  <div className="mt-4 rounded-2xl bg-slate-900 p-5">
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
                          bestPick.evidence_tier === "L1" ? "bg-emerald-500/20 text-emerald-400"
                          : bestPick.evidence_tier === "L2" ? "bg-amber-500/20 text-amber-400"
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

                <h3 className="mb-3 mt-7 text-base font-bold text-slate-900">Rekomendasi Routine-mu</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORY_ORDER.filter((c) => byCategory[c]?.length).map((cat) => (
                    <ProductCard
                      key={cat}
                      category={cat}
                      r={byCategory[cat][0]}
                      alternatives={byCategory[cat].slice(1)}
                      routineStep={CATEGORY_ORDER.indexOf(cat) + 1}
                      routineTotal={CATEGORY_ORDER.length}
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
  category, r, alternatives, routineStep, routineTotal,
}: {
  category: string;
  r: Recommendation;
  alternatives: Recommendation[];
  routineStep: number;
  routineTotal: number;
}) {
  const [consultantOpen, setConsultantOpen] = useState(false);
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [compareWith, setCompareWith] = useState<Recommendation | null>(null);
  const Icon = category === "Sunscreen" ? Sun : Droplets;
  let badge = { label: "Alternative", bg: "bg-orange-50", fg: "text-orange-700" };
  if (r.total_pct >= 90) badge = { label: "Highly Recommended", bg: "bg-emerald-50", fg: "text-emerald-700" };
  else if (r.total_pct >= 75) badge = { label: "Good Match", bg: "bg-amber-50", fg: "text-amber-700" };

  const activeAnswer = activeQ
    ? SUGGESTED_QUESTIONS.find((sq) => sq.q === activeQ)?.getAnswer(r, alternatives, routineStep, routineTotal, category)
    : null;

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
        onClick={() => { setConsultantOpen(!consultantOpen); setActiveQ(null); }}
        className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-blue-600"
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
                  onClick={() => setActiveQ(activeQ === sq.q ? null : sq.q)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    activeQ === sq.q ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {sq.q}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {activeAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2.5 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                    {activeAnswer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
    verdictText = `${winner.brand} dan ${loser.brand} memperoleh skor total yang setara (${winner.total_pct}%). Sistem memprioritaskan ${winner.brand} karena unggul pada Skin Match, kriteria utama dalam rekomendasi kami.`;
  } else if (factorDiffs.length >= 2) {
    verdictText = `${winner.brand} dipilih sebagai rekomendasi utama karena memberikan keseimbangan lebih baik antara ${factorDiffs[0].label.toLowerCase()} dan ${factorDiffs[1].label.toLowerCase()} dibanding ${loser.brand}, sambil tetap memenuhi seluruh syarat keamanan (BPOM, budget, dan kehamilan).`;
  } else if (factorDiffs.length === 1) {
    verdictText = `${winner.brand} dipilih karena unggul pada ${factorDiffs[0].label.toLowerCase()} dibanding ${loser.brand}, dengan seluruh syarat keamanan (BPOM, budget, kehamilan) tetap terpenuhi di kedua produk.`;
  } else {
    verdictText = `${winner.brand} dipilih karena skor totalnya sedikit lebih tinggi secara keseluruhan (${winner.total_pct}% vs ${loser.total_pct}%).`;
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
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                alt.id === b.id ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              {alt.brand}
            </button>
          ))}
        </div>
      )}

      {/* Badge pemenang vs alternatif */}
      <div className="grid grid-cols-2 gap-2">
        {[a, b].map((p) => {
          const isWinner = p.id === winner.id && !isFullyIdentical;
          return (
            <div key={p.id} className={`rounded-lg px-2.5 py-2 text-center ${isWinner ? "bg-emerald-100" : "bg-white border border-slate-200"}`}>
              <p className={`flex items-center justify-center gap-1 text-[10px] font-bold ${isWinner ? "text-emerald-700" : "text-slate-500"}`}>
                {isFullyIdentical ? <Scale size={11} /> : isWinner ? <Trophy size={11} /> : <TriangleAlert size={11} />}
                {isFullyIdentical ? "Setara" : isWinner ? "Recommended" : "Alternative"}
              </p>
              <p className="truncate text-xs font-bold text-slate-900">{p.brand}</p>
              <p className="text-[10px] text-slate-400">
                {isWinner ? `Confidence ${p.confidence_pct}%` : `Overall Score ${p.total_pct}%`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3 items-center gap-2 text-center">
        <p className="truncate text-xs font-bold text-slate-900">{a.brand}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">vs</p>
        <p className="truncate text-xs font-bold text-slate-900">{b.brand}</p>
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-3 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(0, (row.av / row.max) * 100)}%` }} />
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
          <p className="text-[11px] font-bold text-slate-700">Decision Factors -- {winner.brand}</p>
          <div className="mt-1.5 flex flex-col gap-1">
            {[
              { label: "Skin Match", pip: pips(winner.skin_match_pct, 40) },
              { label: "Ingredient", pip: pips(winner.ingredient_match_pct, 30) },
              { label: "Synergy", pip: pips(Math.max(winner.synergy_pct, 0), 10) },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{f.label}</span>
                <span className="text-[11px] font-bold text-blue-600">{"+".repeat(f.pip)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">BPOM</span>
              <Check size={12} className="text-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Budget</span>
              <Check size={12} className="text-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Pregnancy</span>
              <span className="text-[11px] font-semibold text-slate-600">{pregnancyLabel}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3.5 rounded-lg bg-emerald-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleCheck size={15} className="shrink-0 text-emerald-600" />
            <p className="text-[11px] font-bold text-emerald-800">AI Verdict</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">Confidence {winner.confidence_pct}%</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-emerald-700">{verdictText}</p>
      </div>

      {!isFullyIdentical && tradeoffs.length > 0 && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-[11px] font-bold text-amber-800">Mengapa bukan {loser.brand}?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
              {loser.brand} tetap merupakan alternatif yang baik, namun belum menjadi pilihan utama karena:
            </p>
            <ul className="mt-1 flex flex-col gap-0.5">
              {tradeoffs.map((t) => (
                <li key={t} className="text-xs leading-relaxed text-amber-700">&bull; {t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
