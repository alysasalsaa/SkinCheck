/**
 * Photo Insight endpoint -- analisis foto wajah OPSIONAL. Recommendation
 * Engine (v7) tetap satu-satunya yang MENENTUKAN produk -- endpoint ini
 * TIDAK pernah memilih/mengubah produk apa pun. Fungsinya cuma dua: (1)
 * observasi visual umum yang edukatif (bukan diagnosis medis), dan (2)
 * menjelaskan KAITAN observasi itu dengan produk yang SUDAH direkomendasikan
 * sistem sebelumnya (dikirim lewat "recommended_products", produk-produk
 * itu sendiri sudah final dari Recommendation Engine). Prinsip sama kayak
 * AI Skin Consultant: LLM di sini cuma mengamati & menjelaskan, bukan
 * mengambil keputusan.
 *
 * PENTING: endpoint ini menerima gambar wajah pengguna sendiri (voluntary
 * upload). Gambar TIDAK disimpan di server kita -- diteruskan langsung ke
 * Gemini API lalu dibuang, tidak ada database write di sini.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum di-set di Vercel." });
  }

  const { image_base64, mime_type, skin_type, conditions, recommended_products } = req.body || {};

  if (!image_base64) {
    return res.status(400).json({ error: "Field 'image_base64' wajib diisi." });
  }

  const systemPrompt = `Kamu adalah asisten yang memberikan OBSERVASI UMUM dan EDUKATIF dari foto wajah, murni untuk pengetahuan pengguna soal skincare sehari-hari.

ATURAN KETAT:
- Ini BUKAN diagnosis medis atau dermatologis. JANGAN pernah gunakan istilah medis/klinis (misal nama penyakit kulit, tingkat keparahan berskala, atau kesimpulan diagnostik).
- JANGAN mengklaim bisa mendeteksi kondisi kesehatan, penyakit kulit, atau memberi angka/skor presisi (misal "kulit kamu 73% berminyak"). Kalau diminta angka presisi, tolak dengan sopan dan jelaskan ini di luar kemampuan yang bertanggung jawab.
- Fokus HANYA pada observasi visual umum & deskriptif yang netral, misalnya: tampilan kilau/matte di beberapa area wajah, tekstur yang terlihat, warna kulit yang tidak merata, dll -- selalu dengan bahasa "tampak", "terlihat", bukan kepastian.
- Kalau foto tidak jelas menunjukkan wajah, atau kualitas gambar tidak memungkinkan observasi yang bermakna, katakan itu dengan jujur -- jangan mengarang observasi.

MENGHUBUNGKAN KE REKOMENDASI (kalau field "recommended_products" di context tidak kosong):
- Setelah observasi visual, JELASKAN KAITANNYA dengan produk yang SUDAH direkomendasikan sistem (bukan produk lain di luar itu) -- sebutkan nama produk & kandungan yang match (field "matched_ingredients") dari context, dan hubungkan ke observasi visual kamu. Contoh pola kalimat: "Karena kulit tampak [observasi], [Nama Produk] yang mengandung [kandungan] bisa membantu [alasan singkat]."
- JANGAN merekomendasikan atau menyebut produk apapun yang TIDAK ada di field "recommended_products". Semua keputusan produk sudah ditentukan sistem sebelumnya -- tugasmu di sini cuma menjelaskan keterkaitannya, bukan memilih ulang.
- Kalau "recommended_products" kosong, cukup beri observasi visual umum tanpa menyebut produk.
- SELALU akhiri jawaban dengan kalimat yang mendorong pengguna berkonsultasi ke dokter kulit/dermatolog untuk kepastian, terutama kalau ada kekhawatiran spesifik.
- Jawab dalam Bahasa Indonesia, nada hangat dan suportif, 4-6 kalimat, tidak menghakimi.`;

  const userContext = (skin_type || (conditions && conditions.length))
    ? `Sebagai konteks tambahan (bukan untuk diverifikasi ulang, cukup jadi latar): pengguna sebelumnya menyebut tipe kulitnya "${skin_type || "-"}"${conditions?.length ? ` dan target utamanya adalah ${conditions.join(", ")}` : ""}.`
    : "";

  const productContext = recommended_products?.length
    ? `\n\nProduk yang SUDAH direkomendasikan sistem (JSON, satu-satunya produk yang boleh kamu sebut):\n${JSON.stringify(recommended_products, null, 2)}`
    : "";

  const userPrompt = `Berikan observasi visual umum yang suportif dari foto wajah ini, sesuai aturan di atas. ${userContext}${productContext}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: userPrompt },
              { inline_data: { mime_type: mime_type || "image/jpeg", data: image_base64 } },
            ],
          }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(502).json({ error: "Gagal menghubungi Gemini API.", detail: errText });
    }

    const data = await geminiRes.json();
    const observation = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!observation) {
      return res.status(200).json({
        observation: "Maaf, foto tidak bisa dianalisis saat ini. Coba lagi dengan foto yang lebih jelas, atau lewati fitur ini -- rekomendasi produkmu tetap berdasarkan jawaban wizard yang sudah kamu isi.",
      });
    }

    return res.status(200).json({ observation });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Terjadi kesalahan internal." });
  }
}
