/**
 * Design Token: Colors
 * "Clinical Minimalism" — terpercaya (biru), sehat (emerald), bersih (netral).
 * Semua warna di UI HARUS ambil dari sini, jangan hardcode hex di komponen.
 */

export const colors = {
  primary: {
    DEFAULT: "#3B82F6", // trust, AI, professional
    hover: "#2563EB",
    light: "#EFF6FF",
    text: "#1D4ED8",
  },
  secondary: {
    DEFAULT: "#10B981", // healthy skin, success
    light: "#D1FAE5",
    text: "#047857",
  },
  warning: {
    DEFAULT: "#F59E0B",
    light: "#FEF3C7",
    text: "#B45309",
  },
  danger: {
    DEFAULT: "#EF4444",
    light: "#FEE2E2",
    text: "#DC2626",
  },
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: {
    primary: "#0F172A",
    secondary: "#64748B",
    muted: "#94A3B8",
  },
} as const;
