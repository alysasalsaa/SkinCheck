/**
 * Design Token: Typography
 * Plus Jakarta Sans untuk semua teks — modern, mudah dibaca, hierarchy jelas.
 * Import font-nya ditaruh di index.html (lihat catatan di bawah file ini).
 */

export const typography = {
  fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  scale: {
    display: "clamp(2.25rem, 4vw, 3.5rem)", // Hero headline — responsif, gak overflow di mobile
    h1: "2rem",
    h2: "1.5rem",
    h3: "1.125rem",
    body: "1rem",
    small: "0.875rem",
    caption: "0.75rem",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

/**
 * CATATAN: tambahin baris ini di <head> file index.html (root project),
 * biar font Plus Jakarta Sans ke-load sebelum React render (nggak ada flash
 * font default kayak yang bikin heading keliatan pudar/serif di prototype awal):
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
 */
