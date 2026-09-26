"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SokraticChatProps {
  scenarioId: string;
  hints: string[];
  onInteraction: () => void;
}

// Sokratic mock responses for when no API key is available
const SOKRATIC_RESPONSES: Record<string, string[]> = {
  default: [
    "Pertanyaan yang bagus! Coba perhatikan lebih teliti — apakah ada sesuatu yang tidak konsisten dalam data yang disajikan artikel ini?",
    "Kamu sudah di jalur yang benar. Sekarang, tanyakan pada dirimu: siapa yang memberikan klaim ini? Apakah sumber tersebut bisa diverifikasi?",
    "Menarik! Sebelum menerima kesimpulan itu, apa yang terjadi jika kamu melihat data dari sudut pandang yang berbeda? Misalnya, bagaimana jika rentang waktunya diperluas?",
    "Coba pikirkan — apakah korelasi selalu berarti sebab-akibat? Apa faktor lain yang mungkin berperan?",
    "Bagus bahwa kamu mempertanyakan itu. Sekarang, perhatikan bagaimana kutipan digunakan dalam artikel. Apakah kutipan itu lengkap?",
  ],
  grafik: [
    "Perhatikan sumbu Y pada grafik. Dari angka berapa ia dimulai? Apa yang terjadi jika kita mulai dari nol?",
    "Skala grafik bisa sangat menipu. Apakah penurunan yang terlihat 'dramatis' itu benar-benar signifikan jika dilihat dalam konteks yang lebih luas?",
  ],
  profesor: [
    "Kamu menyebutkan profesor — sudahkah kamu mencoba mencari tahu apakah orang ini benar-benar ada? Apa yang bisa kamu gunakan untuk memverifikasinya?",
    "Mengutip otoritas adalah hal yang umum. Tapi apakah otoritas yang dikutip benar-benar ahli di bidang yang relevan? Bagaimana kamu bisa memastikannya?",
  ],
  falasi: [
    "Kamu menemukan sesuatu yang penting! Jenis argumen apa yang digunakan di sini? Apakah argumennya menyerang ide atau menyerang orangnya?",
    "Perhatikan bagaimana artikel menarik kesimpulan. Apakah sampel datanya cukup besar untuk kesimpulan sekuat itu?",
  ],
};

function getSmartResponse(message: string, hints: string[], messageCount: number): string {
  const lower = message.toLowerCase();

  // Check for topic-specific keywords
  if (lower.includes("grafik") || lower.includes("sumbu") || lower.includes("skala") || lower.includes("chart")) {
    return SOKRATIC_RESPONSES.grafik[Math.min(messageCount % 2, SOKRATIC_RESPONSES.grafik.length - 1)];
  }
  if (lower.includes("profesor") || lower.includes("doktor") || lower.includes("universitas") || lower.includes("andi")) {
    return SOKRATIC_RESPONSES.profesor[Math.min(messageCount % 2, SOKRATIC_RESPONSES.profesor.length - 1)];
  }
  if (lower.includes("falasi") || lower.includes("logika") || lower.includes("argumen") || lower.includes("bias")) {
    return SOKRATIC_RESPONSES.falasi[Math.min(messageCount % 2, SOKRATIC_RESPONSES.falasi.length - 1)];
  }

  // Provide hints progressively
  if (lower.includes("bantuan") || lower.includes("petunjuk") || lower.includes("hint") || lower.includes("bingung")) {
    const hintIndex = Math.min(messageCount, hints.length - 1);
    return `💡 ${hints[hintIndex]}`;
  }

  // Default Sokratic response
  return SOKRATIC_RESPONSES.default[messageCount % SOKRATIC_RESPONSES.default.length];
}

export default function SokraticChat({
  scenarioId,
  hints,
  onInteraction,
}: SokraticChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo, Investigator! 🔍 Saya adalah asisten AI Sokratik-mu. Saya tidak akan memberikan jawaban langsung, tapi saya akan membantumu berpikir dengan pertanyaan-pertanyaan penuntun. Apa yang menurutmu mencurigakan dari artikel ini?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userMessageCount = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    onInteraction();
    userMessageCount.current++;

    // Try API first, fall back to smart mock
    let responseText: string;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          scenarioId,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        responseText = data.response;
      } else {
        responseText = getSmartResponse(
          userMessage.content,
          hints,
          userMessageCount.current
        );
      }
    } catch {
      responseText = getSmartResponse(
        userMessage.content,
        hints,
        userMessageCount.current
      );
    }

    // Simulate typing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-surface-200 mb-3 flex items-center gap-2">
        🤖 Asisten AI Sokratik
      </h3>

      <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <p className="text-[10px] text-amber-300/80">
          AI ini membimbing dengan pertanyaan, bukan jawaban langsung
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "chat-bubble-user text-white"
                    : "chat-bubble-ai text-surface-200/90"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-surface-200/60" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-start"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-ai px-4 py-3 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-primary-400" />
              <span className="text-xs text-surface-200/50">
                Berpikir...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu..."
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface-900/60 border border-primary-500/15 text-sm text-surface-200 placeholder-surface-200/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
