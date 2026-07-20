import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Technology", to: "/#technology" },
  { label: "Cara Kerja", to: "/#how-it-works" },
  { label: "Impact", to: "/impact" },
  { label: "About", to: "/about" },
];

/**
 * Alasan UX: navbar konsisten di semua halaman bikin user nggak "kehilangan
 * arah" pas pindah dari Landing ke Impact/About -- mereka selalu tau cara
 * balik atau lanjut ke Assessment dari mana aja. Menu hamburger di mobile
 * penting -- tanpa itu, link navigasi sama sekali nggak bisa diakses di HP.
 */
export function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavClick(to: string) {
    setMobileOpen(false);
    if (to.startsWith("/#")) navigate(to);
  }

  return (
    <nav className="relative z-20 mx-auto max-w-[1200px] px-6 py-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">SkinCheck</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.to}
              onClick={(e) => {
                if (link.to.startsWith("/#")) {
                  e.preventDefault();
                  handleNavClick(link.to);
                }
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/assessment")} size="sm" className="hidden rounded-lg bg-primary text-white hover:bg-primary-dark sm:inline-flex">
            Mulai Analisis
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            aria-label="Buka menu navigasi"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="mt-3 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.to}
              onClick={(e) => {
                if (link.to.startsWith("/#")) {
                  e.preventDefault();
                  handleNavClick(link.to);
                } else {
                  setMobileOpen(false);
                }
              }}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
          <Button
            onClick={() => { setMobileOpen(false); navigate("/assessment"); }}
            size="sm"
            className="mt-1 rounded-lg bg-primary text-white hover:bg-primary-dark sm:hidden"
          >
            Mulai Analisis
          </Button>
        </div>
      )}
    </nav>
  );
}
