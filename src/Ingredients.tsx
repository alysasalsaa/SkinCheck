import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FlaskConical, ChevronDown, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const SUPABASE_URL = "https://ncdbcxhnkpzgmoioxskg.supabase.co";
const SUPABASE_KEY = "sb_publishable_WjZblozn_J7IhWpOWJ2MLw_ApxuFN2w";

interface Ingredient {
  ingredient_name: string;
  category: string;
  benefits: string;
  suitable_for: string[];
  pregnancy_safety: "aman" | "perlu_konsultasi" | "tidak_aman";
  avoid_combination_with: string[];
  notes: string | null;
}

const PREGNANCY_BADGE = {
  aman: { label: "Aman untuk hamil", icon: ShieldCheck, cls: "bg-success-light text-success" },
  perlu_konsultasi: { label: "Perlu konsultasi", icon: ShieldQuestion, cls: "bg-warning-light text-warning" },
  tidak_aman: { label: "Tidak aman hamil", icon: ShieldAlert, cls: "bg-red-50 text-red-600" },
};

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/ingredients_knowledge?select=*&order=ingredient_name.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(ingredients.map((i) => i.category))).sort();

  const filtered = ingredients.filter((i) => {
    const matchQuery = i.ingredient_name.toLowerCase().includes(query.toLowerCase()) || i.benefits.toLowerCase().includes(query.toLowerCase());
    const matchCategory = !activeCategory || i.category === activeCategory;
    return matchQuery && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      <Navbar />

      <section className="mx-auto max-w-[1200px] px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light">
          <FlaskConical size={22} className="text-primary" />
        </div>
        <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-primary">Knowledge Base</span>
        <h1 className="mx-auto mt-2 max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">
          Ingredient Library
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-slate-500">
          {ingredients.length} kandungan aktif yang dipakai sistem kami untuk mencocokkan rekomendasi -- cari fungsi, keamanan, dan sinerginya di sini.
        </p>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kandungan (misal: Niacinamide, Retinol)..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${!activeCategory ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"}`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(activeCategory === c ? null : c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${activeCategory === c ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">Memuat knowledge base...</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Nggak ada kandungan yang cocok sama pencarian ini.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((ing, i) => {
              const badge = PREGNANCY_BADGE[ing.pregnancy_safety];
              const isOpen = expanded === ing.ingredient_name;
              return (
                <motion.div
                  key={ing.ingredient_name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -3, boxShadow: "0 8px 20px rgba(15,23,42,0.08)" }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <button onClick={() => setExpanded(isOpen ? null : ing.ingredient_name)} className="flex w-full items-start justify-between text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{ing.category}</span>
                      <h3 className="text-base font-bold text-ink">{ing.ingredient_name}</h3>
                    </div>
                    <ChevronDown size={16} className={`mt-1 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{ing.benefits}</p>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <badge.icon size={13} className="text-slate-400" />
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.cls}`}>{badge.label}</span>
                          </div>
                          {ing.suitable_for?.length > 0 && (
                            <p className="text-xs text-slate-500">
                              <b className="text-slate-700">Cocok untuk:</b> {ing.suitable_for.join(", ")}
                            </p>
                          )}
                          {ing.avoid_combination_with?.length > 0 && (
                            <p className="text-xs text-slate-500">
                              <b className="text-slate-700">Hindari dikombinasikan dengan:</b> {ing.avoid_combination_with.join(", ")}
                            </p>
                          )}
                          {ing.notes && <p className="text-xs italic text-slate-400">{ing.notes}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
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
