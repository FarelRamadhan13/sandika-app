import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      message = "",
      history = [],
      scenarioTitle,
      scenarioCategory,
      articleHeadline,
      articleSource,
      articleAuthor,
      fallacies = [],
      hints = [],
      graphTitle,
      misleadingYMin,
      correctYMin,
    } = body;

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Dynamically construct Socratic System Instruction based on the active scenario
    const dynamicSystemPrompt = `Kamu adalah Asisten Investigasi Jurnalistik dan Tutor Berpikir Kritis cerdas untuk platform edukasi anti-hoax SANDIKA (Metode Sokratik).

KONTEKS STUDI KASUS YANG SEDANG DISELIDIKI SISWA:
- Judul Skenario: "${scenarioTitle || "Analisis Berita Investigasi"}"
- Kategori Kasus: "${scenarioCategory || "Jurnalisme & Literasi Kritis"}"
- Headline Artikel: "${articleHeadline || "Berita Investigasi"}"
- Sumber & Penulis Fiktif: ${articleSource || "Media Berita"} oleh ${articleAuthor || "Wartawan"}
- Grafik Data: "${graphTitle || "Visualisasi Data"}" (Manipulasi: Sumbu Y dimulai dari angka ${
      misleadingYMin ?? "bukan 0"
    } sehingga perubahan terlihat dramatis, padahal baseline objektif harus mulai dari ${
      correctYMin ?? 0
    })
${
  Array.isArray(fallacies) && fallacies.length > 0
    ? `- Celah Kebohongan & Falasi Logika dalam Artikel:\n${fallacies
        .map(
          (f: any, i: number) =>
            `  ${i + 1}. [${f.type || "falasi"}] "${f.text}" — ${f.explanation || "Kecacatan penalaran"}`
        )
        .join("\n")}`
    : ""
}
${
  Array.isArray(hints) && hints.length > 0
    ? `- Petunjuk Kasus Ini:\n${hints.map((h: string) => `  - ${h}`).join("\n")}`
    : ""
}

TUGAS DAN PRINSIP UTAMA:
1. BANTU PELAJAR MENYELESAIKAN INVESTIGASI: Bimbing pelajar agar berhasil mendeteksi falasi logika, manipulasi grafik, dan misinformasi dalam skenario di atas.
2. METODE SOKRATIK: JANGAN PERNAH membocorkan jawaban secara langsung (misal: jangan langsung sebut 'jawaban paragraf 2 adalah cherry-picking'). Sebaliknya, gunakan pertanyaan pemantik nalar yang menuntun mereka melihat kejanggalan sendiri.
3. SPESIFIK KE TOPIK: Gunakan nama tokoh, kutipan, klaim, atau angka grafik spesifik dari skenario yang sedang dianalisis untuk menunjukkan bahwa kamu benar-benar mengamati kasus ini bersamanya.
4. NADA BICARA: Ramah, suportif, kritis, dan memotivasi seperti mentor detektif atau jurnalis senior yang membimbing juniornya.
5. JIKA SISWA BINGUNG ATAU MINTA PETUNJUK: Berikan panduan bertahap (clue) dari level umum menuju petunjuk yang lebih fokus.
6. FORMAT JAWABAN: Pertahankan respons tetap ringkas dan padat (1-2 paragraf pendek ditambah 1 pertanyaan pemantik nalar) agar dialog mengalir dinamis.`;

    if (apiKey) {
      const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest"];
      let responseText: string | null = null;
      let lastError: any = null;

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);

      // Clean and format history to ensure strictly alternating user/model turns
      const formattedHistory: { role: string; parts: { text: string }[] }[] = [];
      if (Array.isArray(history)) {
        for (const msg of history) {
          if (!msg || !msg.content) continue;
          const role =
            msg.role === "assistant" || msg.role === "model" ? "model" : "user";

          // The very first history turn must be from 'user'
          if (formattedHistory.length === 0 && role !== "user") {
            continue;
          }

          // Avoid consecutive identical roles
          if (
            formattedHistory.length > 0 &&
            formattedHistory[formattedHistory.length - 1].role === role
          ) {
            continue;
          }

          formattedHistory.push({
            role,
            parts: [{ text: msg.content }],
          });
        }
      }

      // If trailing message is 'user', pop it because sendMessage(message) will be the next 'user' turn
      if (
        formattedHistory.length > 0 &&
        formattedHistory[formattedHistory.length - 1].role === "user"
      ) {
        formattedHistory.pop();
      }

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: dynamicSystemPrompt,
            generationConfig: {
              temperature: 0.75,
            },
          });

          const chat = model.startChat({
            history: formattedHistory,
          });

          const result = await chat.sendMessage(message);
          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          lastError = err;
          console.warn(`Gemini chat model ${modelName} error:`, err);
        }
      }

      if (responseText) {
        return NextResponse.json({
          response: responseText,
          success: true,
          modelUsed: "gemini-2.5-flash",
        });
      }

      console.error("All Gemini chat models failed:", lastError);
    }

    // Dynamic fallback Socratic response if Gemini is unavailable
    const contextualFallback = getContextualSocraticFallback(
      message,
      scenarioTitle,
      hints
    );

    return NextResponse.json({
      response: contextualFallback,
      isFallback: true,
      success: true,
    });
  } catch (error: any) {
    console.error("Chat API top-level error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada sistem asisten AI",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

function getContextualSocraticFallback(
  message: string,
  scenarioTitle?: string,
  hints: string[] = []
): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("grafik") ||
    lower.includes("sumbu") ||
    lower.includes("skala") ||
    lower.includes("angka")
  ) {
    return "Pengamatan yang tajam tentang grafiknya! 📊 Coba amati sumbu vertikalnya: dari angka berapa sumbu tersebut dimulai? Apakah memotong sumbu dari angka tertentu dapat membesar-besarkan tren yang sebenarnya biasa saja? Menurutmu apa dampaknya jika kita mulai dari angka 0?";
  }

  if (
    lower.includes("siapa") ||
    lower.includes("sumber") ||
    lower.includes("penulis") ||
    lower.includes("ahli") ||
    lower.includes("dokter") ||
    lower.includes("profesor")
  ) {
    return "Pertanyaan yang sangat esensial bagi investigator! 🔍 Coba cek kredibilitas tokoh atau lembaga yang dikutip di artikel. Kamu bisa membuka tab 'Pelacakan Fakta' di samping untuk memverifikasi apakah nama dan institusi tersebut terdaftar resmi di basis data.";
  }

  if (
    lower.includes("falasi") ||
    lower.includes("logika") ||
    lower.includes("argumen") ||
    lower.includes("klaim")
  ) {
    return "Bagus sekali kamu mulai membongkar argumennya! ⚖️ Perhatikan cara penulis menarik kesimpulan: apakah klaimnya didasarkan pada hubungan sebab-akibat yang sahih, atau sekadar menghubungkan dua kejadian secara gegabah? Apakah sampel yang digunakan cukup representatif?";
  }

  if (
    lower.includes("bantuan") ||
    lower.includes("bingung") ||
    lower.includes("petunjuk") ||
    lower.includes("tolong")
  ) {
    if (hints && hints.length > 0) {
      return `Tidak masalah merasa tertantang, itulah seni investigasi! 💡 Berikut petunjuk pemantik nalar:\n\n"${hints[0]}"\n\nCoba renungkan pertanyaan tersebut saat membaca ulang artikel. Apa yang kamu temukan?`;
    }
    return "Jangan khawatir, investigasi memang butuh ketelitian! 💡 Coba mulai dari hal paling mendasar: sorot satu kalimat di artikel yang membuat klaim paling luar biasa. Apakah kalimat itu terdengar seperti fakta teruji atau asumsi sepihak?";
  }

  return `Pikiran kritis yang menarik untuk studi kasus ${scenarioTitle ? `"${scenarioTitle}"` : "ini"}! 🕵️‍♂️ Sekarang coba refleksikan: apakah bukti pendukung yang diberikan artikel ini benar-benar kuat, atau ada celah logika yang berusaha ditutupi dengan bahasa sensasional? Bagian mana yang paling ingin kamu bedah lebih lanjut?`;
}
