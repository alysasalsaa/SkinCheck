import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Technology", to: "/#technology" },
  { label: "Cara Kerja", to: "/#how-it-works" },
  { label: "Impact", to: "/impact" },
];

/**
 * Alasan UX: navbar konsisten di semua halaman bikin user nggak "kehilangan
 * arah" pas pindah dari Landing ke Impact -- mereka selalu tau cara balik
 * atau lanjut ke Assessment dari mana aja.
 */
export function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
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
                navigate(link.to);
              }
            }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            {link.label}
          </a>
        ))}
      </div>

      <Button onClick={() => navigate("/assessment")} size="sm" className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Mulai Analisis
      </Button>
    </nav>
  );
}
