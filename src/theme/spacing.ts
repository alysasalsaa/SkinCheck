/**
 * Design Token: Spacing, Radius, Shadow
 * Card besar, banyak whitespace, sudut membulat, shadow tipis — sesuai brief
 * "Clinical Minimalism". Semua komponen pakai skala ini biar konsisten.
 */

export const spacing = {
  xs: "0.5rem",   // 8px
  sm: "0.75rem",  // 12px
  md: "1rem",     // 16px
  lg: "1.5rem",   // 24px
  xl: "2rem",     // 32px
  "2xl": "3rem",  // 48px
  "3xl": "4rem",  // 64px
} as const;

export const radius = {
  sm: "0.5rem",   // 8px  — badge, chip kecil
  md: "0.75rem",  // 12px — button, input
  lg: "1rem",     // 16px — card kecil
  xl: "1.25rem",  // 20px — card besar, hero panel
  full: "9999px", // pill, avatar
} as const;

export const shadow = {
  // Shadow tipis sesuai brief — jangan berat/dramatis, cuma kasih depth halus
  sm: "0 1px 2px rgba(15, 23, 42, 0.04)",
  md: "0 2px 8px rgba(15, 23, 42, 0.06)",
  lg: "0 8px 24px rgba(15, 23, 42, 0.08)",
  glow: "0 0 0 1px rgba(59, 130, 246, 0.08), 0 8px 24px rgba(59, 130, 246, 0.12)", // buat glass card hero
} as const;

export const container = {
  maxWidth: "1200px",
  padding: "1.5rem",
} as const;
