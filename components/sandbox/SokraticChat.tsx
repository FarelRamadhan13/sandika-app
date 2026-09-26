"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  HelpCircle,
  BarChart2,
  Search,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";
import type { Scenario } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isAi?: boolean;
}

interface SokraticChatProps {
  scenario?: Scenario;
  scenarioId?: string;
  hints?: string[];
  onInteraction: () => void;
}

const QUICK_CHIPS = [
  {
    icon: HelpCircle,
    label: "💡 Minta Petunjuk",
    prompt: "Bisa berikan saya petunjuk penuntun untuk menemukan kejanggalan dalam artikel ini?",
  },
  {
    icon: BarChart2,
    label: "📊 Cek Grafik",
    prompt: "Apa yang janggal dari grafik visualisasi data yang disajikan di artikel ini?",
  },
  {
    icon: Search,
    label: "🔍 Cek Sumber",
    prompt: "Bagaimana cara saya membuktikan apakah pakar atau institusi yang dikutip di sini terpercaya?",
  },
  {
    icon: BrainCircuit,
    label: "⚖️ Deteksi Falasi",
    prompt: "Argumen mana di artikel ini yang mengandung kecacatan logika (logical fallacy)?",
  },
];

export default function SokraticChat({
  scenario,
  scenarioId,
  hints = [],
  onInteraction,
}: SokraticChatProps) {
  const activeHints = scenario?.sokraticHints || hints;
  const activeTitle = scenario?.title || "Studi Kasus";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo, Investigator! 🔍 Saya adalah Asisten AI Sokratik-mu yang didukung oleh Gemini 2.5 Flash.\n\nSaya di sini untuk menemanimu menganalisis artikel "${activeTitle}". Saya tidak akan langsung memberi tahu jawabannya, tapi saya akan memandu daya nalarmu dengan pertanyaan kritis agar kamu bisa membongkar kejanggalan kasus ini secara mandiri.\n\nApa bagian yang paling mencurigakan menurut pengamatanmu?`,
      timestamp: new Date(),
      isAi: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText ?? input).trim();
    if (!textToSend || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    onInteraction();

    try {
      const allFallacies =
        scenario?.article?.paragraphs?.flatMap((p) => p.fallacies || []) || [];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          scenarioId: scenario?.id || scenarioId,
          scenarioTitle: scenario?.title,
          scenarioCategory: scenario?.category,
          articleHeadline: scenario?.article?.headline,
          articleSource: scenario?.article?.source,
          articleAuthor: scenario?.article?.author,
          fallacies: allFallacies,
          hints: activeHints,
          graphTitle: scenario?.graphData?.title,
          misleadingYMin: scenario?.graphData?.misleadingYMin,
          correctYMin: scenario?.graphData?.correctYMin,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const replyContent =
        data?.response ||
        "Pertanyaan yang tajam! Coba hubungkan temuanmu dengan data rujukan resmi di tab Pelacakan Fakta.";

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date(),
        isAi: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Gagal mengirim pesan chat:", err);
      const errorMessage: Message = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content:
          "💡 Coba perhatikan kembali klaim utama di artikel: apakah sampel yang digunakan cukup mewakili, dan apakah grafik menampilkan baseline dari angka 0?",
        timestamp: new Date(),
        isAi: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col flex-1 min-h-0">
      {/* Header Info */}
      <div className="shrink-0 flex items-center justify-between mb-2 pb-1.5 border-b border-primary-500/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-primary-500 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-surface-100 flex items-center gap-1.5">
              <span>Asisten AI Sokratik</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-surface-200/50">
              Didukung Gemini 2.5 Flash • Menuntun Nalar Kritis
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium">
          Tutor Interaktif
        </span>
      </div>

      <div className="shrink-0 flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[10.5px] leading-tight">
        <Sparkles className="w-3 h-3 shrink-0 text-amber-400" />
        <span>
          Metode Sokratik: AI ini membimbing dengan pertanyaan penuntun agar kamu membongkar kasus mandiri.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-[240px] overflow-y-auto space-y-2.5 mb-2 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-2.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-primary-600 flex items-center justify-center shrink-0 shadow-sm shadow-purple-900/30 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-line text-left ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white rounded-tr-xs shadow-md shadow-primary-950/40"
                    : "bg-surface-900/90 border border-primary-500/20 text-surface-100 rounded-tl-xs shadow-sm"
                }`}
              >
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center shrink-0 text-surface-200 mt-0.5">
                  <User className="w-4 h-4 text-surface-300" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-primary-600 flex items-center justify-center shrink-0 shadow-sm shadow-purple-900/30">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-surface-900/90 border border-primary-500/20 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span className="text-xs text-purple-300/80 font-medium">
                Gemini sedang meracik pertanyaan penuntun...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="shrink-0 mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip.prompt)}
            disabled={isTyping}
            className="shrink-0 px-2.5 py-1 rounded-full bg-surface-900/80 hover:bg-primary-500/15 border border-primary-500/15 hover:border-primary-500/30 text-[11px] text-surface-200/80 hover:text-primary-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="shrink-0 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan kejanggalan atau minta petunjuk..."
          disabled={isTyping}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-xs sm:text-sm text-surface-100 placeholder-surface-200/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-500 hover:to-primary-500 text-white shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          title="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
