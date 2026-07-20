import { motion } from "framer-motion";
import { Code2, FlaskConical, Calculator, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const TEAM = [
  {
    name: "Alysa Salsabila Irfan Putri",
    nim: "24051130049",
    prodi: "Teknologi Informasi",
    icon: Code2,
    role: "AI & Software Development",
    desc: "Membangun Recommendation Engine, Knowledge Base, Explainable AI, dan seluruh aplikasi web.",
  },
  {
    name: "Asikha Shahrin Atsari",
    nim: "25030330026",
    prodi: "Pendidikan Kimia",
    icon: FlaskConical,
    role: "Domain Expert -- Ingredient Science",
    desc: "Bertanggung jawab atas kajian ilmiah kandungan aktif: klasifikasi bahan, interaksi antar-ingredient, dan safety profile.",
  },
  {
    name: "Virgin Listianti",
    nim: "25030630020",
    prodi: "Matematika",
    icon: Calculator,
    role: "Modeling & Evaluation",
    desc: "Merancang model pembobotan skor, formula confidence, dan kerangka evaluasi kuantitatif sistem.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Navbar />

      <section className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
            <Users size={22} className="text-blue-600" />
          </div>
          <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-blue-600">Tim</span>
          <h1 className="mx-auto mt-2 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
            Tim di Balik SkinCheck
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Proyek untuk GEMASTIK 2026, dibangun oleh tim lintas disiplin -- teknologi, sains bahan
            kimia, dan matematika terapan -- karena skincare yang baik butuh lebih dari satu sudut pandang.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.nim}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <member.icon size={22} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                <p className="text-xs text-slate-400">{member.nim} &middot; {member.prodi}</p>
              </div>
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
