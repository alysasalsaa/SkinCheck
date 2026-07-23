/**
 * AI Consultant endpoint -- Context-Augmented Generation (CAG), BUKAN RAG.
 * LLM di sini TIDAK memilih produk dan TIDAK mencari data sendiri (tidak
 * ada vector search/embedding). Fakta SPESIFIK (skor, harga, BPOM, status
 * hamil, nama produk) WAJIB diambil dari context JSON -- LLM boleh
 * menambahkan pengetahuan umum skincare/dermatologi yang sudah mapan
 * (misal "apa fungsi Ceramide secara umum") untuk melengkapi jawaban,
 * tapi tidak boleh mengarang fakta spesifik soal produk kita.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum di-set di Vercel." });
  }

  const { question, user, recommendation, comparison, evidence, confidence, constraints, routine, preference } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: "Field 'question' wajib diisi." });
  }

  const systemPrompt = `You are SkinCheck AI Consultant, asisten konsultasi skincare berbasis data.

ATURAN:
- Fakta SPESIFIK (nama produk, skor, harga, status BPOM, status kehamilan, kandungan) WAJIB berasal dari context JSON yang diberikan. JANGAN mengarang angka, harga, atau nama produk yang tidak ada di context.
- Kalau ada field "preference" di context (riwayat produk yang pernah cocok/tidak cocok pengguna), dan pertanyaannya soal itu (misal "mengapa produk ini cocok padahal aku tidak cocok pakai X"), jawab dengan MEMBANDINGKAN kandungan: sebutkan kandungan_match_tidak_cocok (kalau ada, jelaskan produk ini tetap mengandung itu makanya skor diturunkan) atau kalau kosong, tegaskan produk ini TIDAK mengandung kandungan yang sama dengan produk yang tidak cocok itu.
- Untuk pertanyaan umum soal fungsi/manfaat suatu kandungan (misal "apa fungsi Niacinamide"), kamu BOLEH menambahkan pengetahuan dermatologi umum yang sudah mapan sebagai pelengkap -- tapi tetap kaitkan dengan data context yang relevan kalau ada.
- Kalau context sama sekali tidak punya info yang relevan DAN kamu juga tidak punya pengetahuan umum yang relevan, jawab: "Maaf, informasi tersebut tidak tersedia dalam hasil analisis saat ini."
- Jangan merekomendasikan produk yang tidak ada di context.
- Jawab selalu dalam Bahasa Indonesia, nada seperti konsultan skincare yang ramah dan jelas -- bukan robot yang membacakan angka mentah.
- Jawaban lengkap dan utuh (jangan terpotong), tapi ringkas: 3-5 kalimat.`;

  const contextData = { user, recommendation, comparison, evidence, confidence, constraints, routine, preference };

  const userPrompt = `Context (JSON, sumber utama informasi soal produk ini):
${JSON.stringify(contextData, null, 2)}

Pertanyaan pengguna: "${question}"

Jawab pertanyaan di atas berdasarkan context JSON ini, dilengkapi pengetahuan umum dermatologi kalau relevan (sesuai aturan di atas). Pastikan jawabanmu lengkap, jangan terpotong di tengah kalimat.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: "Gagal menghubungi Gemini API.", detail: errText });
    }

    const data = await geminiRes.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return res.status(200).json({ answer: "Maaf, informasi tersebut tidak tersedia dalam hasil analisis saat ini." });
    }

    return res.status(200).json({ answer });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Terjadi kesalahan internal." });
  }
}
