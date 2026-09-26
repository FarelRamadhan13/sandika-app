import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { Scenario } from "@/lib/types";

const FALLACY_LIST = [
  "cherry-picking",
  "ad-hominem",
  "appeal-to-authority",
  "false-cause",
  "hasty-generalization",
  "straw-man",
  "bandwagon",
  "bias-kutipan",
  "slippery-slope",
  "false-dilemma",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      topic = "Kesehatan & Pengobatan Alternatif",
      category = "Kesehatan & Medis",
      difficulty = "Menengah",
      customPrompt = "",
      apiKey: userApiKey,
    } = body;

    // Use Gemini API Key provided by server .env
    const apiKey =
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      userApiKey;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GOOGLE_GEMINI_API_KEY belum dikonfigurasi di file .env. Pastikan API key telah terpasang di server.",
        },
        { status: 500 }
      );
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Primary model is gemini-2.5-flash, fallback to gemini-flash-latest
    const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest"];
    let scenario: Scenario | null = null;
    let lastError: any = null;

    const uniqueSeed = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const chosenTopic = customPrompt.trim() ? customPrompt.trim() : topic;

    const prompt = `Anda adalah kurator investigasi jurnalisme dan edukator berpikir kritis tingkat dunia untuk platform edukasi anti-hoax SANDIKA (Sandbox Anti-Hoax).
Tugas Anda: Buat sebuah skenario investigasi artikel berita sintetis/fiktif BARU dan UNIK tentang topik: "${chosenTopic}".
Kategori: ${category}
Tingkat Kesulitan: ${difficulty}
Random Seed Unik: ${uniqueSeed}

Artikel berita ini HARUS sengaja disusupi dengan berbagai kecacatan logika (logical fallacies), manipulasi visual grafik (sumbu Y terpotong), dan sumber fiktif agar siswa dapat membongkarnya di sandbox investigasi.

ATURAN WAJIB:
1. Tulislah artikel dalam Bahasa Indonesia yang mengalir, realistis, dan meyakinkan seperti artikel berita media online sungguhan.
2. JANGAN gunakan nama tokoh atau judul yang sama dengan template standar. Buat sudut pandang cerita yang orisinal dan segar berdasarkan topik yang diminta.
3. KETENTUAN STRUKTUR JSON (Kembalikan HANYA JSON murni yang valid, tanpa teks markdown pembuka/penutup selain JSON):
{
  "id": "scenario-ai-${Date.now()}",
  "title": "Judul skenario kasus investigasi yang memikat dan ringkas",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "isAiGenerated": true,
  "article": {
    "headline": "Judul berita sensasional atau provokatif yang dibuat oleh portal berita fiktif",
    "source": "Nama portal berita fiktif (contoh: 'Warta Sains Nusantara', 'Kilas Peristiwa Digital', dll)",
    "author": "Nama wartawan fiktif yang unik",
    "date": "26 September 2026",
    "imageCaption": "Takarir foto atau grafik yang mendampingi artikel",
    "paragraphs": [
      {
        "id": "p1",
        "text": "Teks paragraf 1...",
        "fallacies": [
          {
            "text": "POTONGAN_PERSIS_YANG_ADA_DI_TEKS_PARAGRAF_INI",
            "type": "hasty-generalization",
            "explanation": "Penjelasan mengapa klaim tersebut merupakan falasi logika."
          }
        ]
      }
    ]
  },
  "graphData": {
    "title": "Judul metrik grafik (contoh: Tingkat Efektivitas Pengobatan (%))",
    "misleadingYMin": 82,
    "misleadingYMax": 95,
    "correctYMin": 0,
    "correctYMax": 100,
    "data": [
      { "year": "2021", "temp": 84.5 },
      { "year": "2022", "temp": 85.1 },
      { "year": "2023", "temp": 86.8 },
      { "year": "2024", "temp": 88.0 },
      { "year": "2025", "temp": 91.2 },
      { "year": "2026", "temp": 94.6 }
    ]
  },
  "searchDatabase": [
    {
      "keywords": ["kata kunci 1", "kata kunci 2"],
      "results": [
        {
          "title": "Judul Hasil Verifikasi / Rilis Resmi",
          "source": "domain-resmi.go.id atau portal-cekfakta.id",
          "snippet": "Ringkasan temuan cek fakta atau klarifikasi lembaga berwenang.",
          "type": "debunk",
          "credibility": "sangat-tinggi"
        }
      ]
    }
  ],
  "totalFallacies": 5,
  "sokraticHints": [
    "Pertanyaan reflektif ala Sokratik 1 untuk merangsang daya nalar siswa?",
    "Pertanyaan reflektif ala Sokratik 2 tanpa langsung membeberkan jawaban?",
    "Pertanyaan reflektif ala Sokratik 3?"
  ]
}

PANDUAN DETAIL:
- "article.paragraphs": Buat 5 sampai 6 paragraf.
- PENTING: Untuk setiap objek di array "fallacies", properti "text" HARUS merupakan potongan kata/kalimat yang PERSIS sama (case-sensitive substring) yang ada di dalam "text" paragraf terkait!
- "type" di dalam fallacies HARUS merupakan salah satu dari: ${JSON.stringify(FALLACY_LIST)}.
- "graphData.data": Array 6 sampai 8 titik data, properti "temp" berisi angka (number).
- "searchDatabase": Berikan 3 sampai 5 entri penelusuran balik (reverse fact-check) yang relevan dengan nama orang fiktif, klaim berita, atau lembaga dalam artikel.
- "totalFallacies": Jumlah total seluruh falasi di seluruh paragraf.
- Kembalikan HANYA format JSON valid.`;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.85,
          },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        if (parsed && parsed.article && Array.isArray(parsed.article.paragraphs)) {
          scenario = parsed as Scenario;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed to generate scenario, trying next:`, err);
      }
    }

    if (!scenario) {
      console.error("All Gemini models failed:", lastError);
      return NextResponse.json(
        {
          success: false,
          error: `Gagal membuat artikel baru dengan Gemini AI: ${
            lastError?.message || "Koneksi ke Gemini API gagal"
          }. Silakan periksa koneksi internet atau kuota API key.`,
        },
        { status: 500 }
      );
    }

    // Ensure scenario has an ID and proper metadata
    const scenarioId = `scenario-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    scenario.id = scenarioId;
    scenario.isAiGenerated = true;

    // Recalculate total fallacies dynamically
    const calculatedTotalFallacies = scenario.article.paragraphs.reduce(
      (sum, p) => sum + (p.fallacies ? p.fallacies.length : 0),
      0
    );
    scenario.totalFallacies = calculatedTotalFallacies || scenario.totalFallacies || 5;

    // Save to Firebase Firestore scenarios collection
    try {
      await adminDb
        .collection("scenarios")
        .doc(scenarioId)
        .set({
          ...scenario,
          createdAt: Date.now(),
          isAiGenerated: true,
        });
      console.log(`Successfully saved AI scenario '${scenario.title}' to Firestore with ID ${scenarioId}`);
    } catch (saveError) {
      console.warn("Could not save AI scenario to Firestore:", saveError);
    }

    return NextResponse.json({
      success: true,
      message: "Skenario berhasil dibuat oleh AI!",
      scenario,
    });
  } catch (error: any) {
    console.error("Scenario generation API error:", error);
    return NextResponse.json(
      {
        error: `Gagal membuat skenario AI: ${error?.message || "Internal server error"}`,
        success: false,
      },
      { status: 500 }
    );
  }
}
