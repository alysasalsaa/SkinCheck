/**
 * AI Consultant endpoint -- Context-Augmented Generation (CAG), BUKAN RAG.
 * LLM di sini TIDAK memilih produk dan TIDAK mencari data sendiri (nggak
 * ada vector search/embedding). Semua context yang dijawab udah dipilih
 * dan dihitung duluan oleh Recommendation Engine v6 -- LLM cuma nyusun
 * kalimat natural dari data yang dikasih, nggak boleh nambah info sendiri.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum di-set di Vercel." });
  }

  const { question, user, recommendation, comparison, evidence, confidence, constraints } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: "Field 'question' wajib diisi." });
  }

  const systemPrompt = `You are SkinCheck AI Consultant, asisten konsultasi skincare berbasis data.

ATURAN KETAT (wajib dipatuhi):
- You are NOT allowed to recommend products outside the provided context.
- You MUST answer ONLY using the structured data provided in the context JSON.
- If the answer cannot be found in the context, respond exactly with:
  "Maaf, informasi tersebut tidak tersedia dalam hasil analisis saat ini."
- Never invent ingredients, scores, prices, or BPOM numbers that are not in the context.
- Never recommend a product that is not present in the context.
- Jawab selalu dalam Bahasa Indonesia, dengan nada seperti konsultan skincare yang ramah dan jelas -- bukan robot yang membacakan angka mentah.
- Jawaban singkat, maksimal 3-4 kalimat.`;

  const contextData = { user, recommendation, comparison, evidence, confidence, constraints };

  const userPrompt = `Context (JSON, satu-satunya sumber informasi yang boleh dipakai):
${JSON.stringify(contextData, null, 2)}

Pertanyaan pengguna: "${question}"

Jawab pertanyaan di atas HANYA berdasarkan context JSON ini.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
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
