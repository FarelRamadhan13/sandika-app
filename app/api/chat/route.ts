import { NextRequest, NextResponse } from "next/server";

// System prompt for Sokratic AI
const SYSTEM_PROMPT = `Kamu adalah asisten investigasi jurnalistik yang menggunakan Metode Sokratik. 
Siswa sedang menganalisis berita palsu tentang klaim penurunan suhu global. 

Celah-celah kebohongan dalam artikel:
1. Grafik memanipulasi sumbu Y (dimulai dari 14.5, bukan 0) agar penurunan terlihat dramatis
2. Prof. Dr. Andi Pratama dan Institut Klimatologi Nusantara tidak ada
3. Data hanya mengambil 5 tahun (cherry-picking) padahal tren iklim perlu data puluhan tahun
4. Menyerang motivasi ilmuwan lain (ad hominem) 
5. Mengklaim penghijauan lokal menurunkan suhu global (false cause)
6. Menggunakan survei opini publik sebagai bukti ilmiah (bandwagon)
7. Kutipan dipotong sehingga menghilangkan konteks penting (bias kutipan)
8. Mendistorsi posisi ilmuwan iklim sebagai "teori usang" (straw man)

ATURAN KETAT:
- JANGAN pernah berikan jawaban secara langsung
- Selalu balas dengan pertanyaan penuntun sesuai Metode Sokratik
- Tuntun siswa untuk menemukan sendiri kejanggalan dalam artikel
- Gunakan bahasa Indonesia yang ramah dan suportif
- Jika siswa benar-benar bingung, berikan petunjuk samar, BUKAN jawaban
- Puji upaya siswa ketika mereka menemukan sesuatu`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    // Try Gemini API first
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "Mulai sesi investigasi." }],
            },
            {
              role: "model",
              parts: [{ text: "Halo, Investigator! Saya siap membantumu menganalisis artikel ini dengan pertanyaan-pertanyaan penuntun. Apa yang menarik perhatianmu?" }],
            },
            ...(history || []).map(
              (msg: { role: string; content: string }) => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
              })
            ),
          ],
          systemInstruction: SYSTEM_PROMPT,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({ response: responseText });
      } catch (error) {
        console.error("Gemini API error:", error);
        // Fall through to mock response
      }
    }

    // Mock Sokratic response if no API key
    return NextResponse.json({
      response: getMockResponse(message),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("grafik") || lower.includes("sumbu") || lower.includes("data")) {
    return "Menarik bahwa kamu memperhatikan grafiknya! Coba lihat lebih teliti — dari angka berapa sumbu Y dimulai? Apakah itu cara yang jujur untuk menampilkan data? Apa yang terjadi jika kita mulai dari angka nol?";
  }
  if (lower.includes("profesor") || lower.includes("andi") || lower.includes("universitas")) {
    return "Pertanyaan bagus tentang sumbernya! Apakah kamu sudah mencoba memverifikasi apakah Prof. Andi Pratama dan Universitas Nusantara benar-benar ada? Coba gunakan alat Pelacakan Balik untuk mencari tahu!";
  }
  if (lower.includes("logika") || lower.includes("argumen") || lower.includes("falasi")) {
    return "Kamu mulai melihat kejanggalan dalam argumentasi! Coba perhatikan — apakah artikel menyerang argumen ilmuwan lain, atau menyerang orangnya? Apa bedanya kedua pendekatan tersebut?";
  }
  if (lower.includes("bingung") || lower.includes("bantuan") || lower.includes("tidak tahu")) {
    return "Tidak apa-apa merasa bingung — itu bagian dari proses belajar! 💡 Coba mulai dari hal paling mendasar: lihat grafik yang ada di artikel. Apakah skalanya terlihat wajar? Dan siapa yang memberikan klaim utama di artikel ini?";
  }

  return "Pertanyaanmu menunjukkan bahwa kamu sedang berpikir kritis — bagus! Sekarang, coba hubungkan apa yang kamu temukan dengan bukti yang ada. Apakah klaim dalam artikel didukung oleh sumber yang bisa diverifikasi? Apa yang terjadi ketika kamu mencari tahu sendiri?";
}
