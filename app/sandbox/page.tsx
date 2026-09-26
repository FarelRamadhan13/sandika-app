"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ArticlePanel from "@/components/sandbox/ArticlePanel";
import GraphTool from "@/components/sandbox/GraphTool";
import ReverseSearch from "@/components/sandbox/ReverseSearch";
import SokraticChat from "@/components/sandbox/SokraticChat";
import scenariosData from "@/data/scenarios.json";
import type { Scenario } from "@/lib/types";
import { FALLACY_TYPES } from "@/lib/fallacies";
import { useAuth } from "@/lib/auth-context";
import {
  BarChart3,
  Search,
  Highlighter,
  Bot,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: "graph", label: "Grafik", icon: BarChart3, emoji: "📊" },
  { id: "search", label: "Lacak Balik", icon: Search, emoji: "🔍" },
  { id: "chat", label: "AI Sokratik", icon: Bot, emoji: "🤖" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SandboxPage() {
  const { user } = useAuth();
  const scenario: Scenario = scenariosData.scenarios[0] as Scenario;

  const [activeTab, setActiveTab] = useState<TabId>("graph");
  const [highlights, setHighlights] = useState<
    {
      paragraphId: string;
      text: string;
      classifiedAs: string;
      isCorrect: boolean | null;
    }[]
  >([]);
  const [graphDiscovered, setGraphDiscovered] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [sokraticCount, setSokraticCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Listen for classification events from ArticlePanel
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const { text, paragraphId, fallacyId } = detail;

      // Check if correct
      const paragraph = scenario.article.paragraphs.find(
        (p) => p.id === paragraphId
      );
      const matchingFallacy = paragraph?.fallacies.find((f) => {
        // Check if the selected text overlaps with any known fallacy text
        const normalizedSelected = text.toLowerCase().trim();
        const normalizedFallacy = f.text.toLowerCase().trim();
        return (
          normalizedSelected.includes(normalizedFallacy.substring(0, 30)) ||
          normalizedFallacy.includes(normalizedSelected.substring(0, 30))
        );
      });

      const isCorrect = matchingFallacy
        ? matchingFallacy.type === fallacyId
        : false;

      const fallacyName =
        FALLACY_TYPES.find((f) => f.id === fallacyId)?.name || fallacyId;

      setHighlights((prev) => [
        ...prev,
        {
          paragraphId,
          text: text.substring(0, 100),
          classifiedAs: fallacyName,
          isCorrect,
        },
      ]);
    };

    window.addEventListener("sandika:classify", handler);
    return () => window.removeEventListener("sandika:classify", handler);
  }, [scenario.article.paragraphs]);

  const handleTextSelect = useCallback(
    (_text: string, _paragraphId: string) => {
      // Handled by the event listener above
    },
    []
  );

  const handleGraphDiscovered = useCallback(() => {
    setGraphDiscovered(true);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchCount((c) => c + 1);
  }, []);

  const handleSokraticInteraction = useCallback(() => {
    setSokraticCount((c) => c + 1);
  }, []);

  // Calculate score
  const correctHighlights = highlights.filter((h) => h.isCorrect === true).length;
  const totalScore =
    correctHighlights * 10 +
    (graphDiscovered ? 10 : 0) +
    Math.min(searchCount * 5, 25);
  const maxScore = scenario.totalFallacies * 10 + 10 + 25;
  const accuracy =
    highlights.length > 0
      ? Math.round((correctHighlights / highlights.length) * 100)
      : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleFinish = async () => {
    setShowResults(true);

    // Try to save score to Firebase
    try {
      await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          studentName: user?.displayName || "Investigator",
          userId: user?.uid || "",
          highlights: highlights.map((h) => ({
            selectedText: h.text,
            classifiedAs: h.classifiedAs,
            correctType: "",
            isCorrect: h.isCorrect,
            paragraphId: h.paragraphId,
          })),
          graphDiscovered,
          searchesPerformed: searchCount,
          sokraticInteractions: sokraticCount,
          totalScore,
          maxScore,
          accuracy,
          completionTimeSeconds: elapsedTime,
        }),
      });
    } catch {
      // Silent fail for demo
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-surface-950">
      {/* Top bar */}
      <div className="sticky top-16 md:top-20 z-30 glass-strong border-b border-primary-500/10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-primary-500/10 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-surface-200/60" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-surface-50 truncate">
                {scenario.title}
              </h1>
              <p className="text-[10px] text-surface-200/50">
                {scenario.category} • {scenario.difficulty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/80 border border-primary-500/10">
              <Clock className="w-3 h-3 text-primary-400" />
              <span className="text-xs font-mono text-surface-200/80">
                {formatTime(elapsedTime)}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/80 border border-primary-500/10">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-mono text-surface-200/80">
                {totalScore}/{maxScore}
              </span>
            </div>

            {/* Finish button */}
            <button
              onClick={handleFinish}
              className="btn-primary text-xs !py-2 !px-4"
            >
              <span className="flex items-center gap-1.5">
                <Target className="w-3 h-3" />
                Selesai
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-180px)]">
          {/* Left: Article Panel */}
          <div className="lg:col-span-3">
            <ArticlePanel
              article={scenario.article}
              onTextSelect={handleTextSelect}
              highlights={highlights}
            />
          </div>

          {/* Right: Tools Panel */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl bg-surface-900/50 border border-primary-500/10">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id ? "tab-active" : "tab-inactive"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.emoji}</span>
                  </button>
                );
              })}
            </div>

            {/* Tool content */}
            <div className="tool-panel rounded-2xl p-5 flex-1 min-h-[400px]">
              {activeTab === "graph" && (
                <GraphTool
                  graphConfig={scenario.graphData}
                  onDiscovered={handleGraphDiscovered}
                />
              )}
              {activeTab === "search" && (
                <ReverseSearch
                  searchDatabase={scenario.searchDatabase}
                  onSearch={handleSearch}
                />
              )}
              {activeTab === "chat" && (
                <SokraticChat
                  scenarioId={scenario.id}
                  hints={scenario.sokraticHints}
                  onInteraction={handleSokraticInteraction}
                />
              )}
            </div>

            {/* Score Summary */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="text-center p-3 rounded-xl bg-surface-900/50 border border-primary-500/10">
                <Highlighter className="w-4 h-4 text-primary-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-50">
                  {highlights.length}
                </p>
                <p className="text-[10px] text-surface-200/50">Sorotan</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-900/50 border border-primary-500/10">
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-50">
                  {accuracy}%
                </p>
                <p className="text-[10px] text-surface-200/50">Akurasi</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-900/50 border border-primary-500/10">
                <Bot className="w-4 h-4 text-accent-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-surface-50">
                  {sokraticCount}
                </p>
                <p className="text-[10px] text-surface-200/50">Chat AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="glass-card rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-surface-50 mb-2">
                Investigasi Selesai!
              </h2>
              <p className="text-surface-200/60 text-sm mb-6">
                Berikut ringkasan performa investigasimu
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-2xl font-bold text-gradient">
                    {totalScore}
                  </p>
                  <p className="text-xs text-surface-200/50">
                    dari {maxScore} poin
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-2xl font-bold text-gradient-accent">
                    {accuracy}%
                  </p>
                  <p className="text-xs text-surface-200/50">Akurasi</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-2xl font-bold text-surface-50">
                    {formatTime(elapsedTime)}
                  </p>
                  <p className="text-xs text-surface-200/50">Waktu</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-2xl font-bold text-surface-50">
                    {correctHighlights}/{scenario.totalFallacies}
                  </p>
                  <p className="text-xs text-surface-200/50">
                    Falasi Ditemukan
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-left mb-6">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-900/40">
                  <span className="text-xs text-surface-200/60">
                    Grafik Terungkap
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      graphDiscovered ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {graphDiscovered ? "✅ Ya" : "❌ Tidak"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-900/40">
                  <span className="text-xs text-surface-200/60">
                    Pencarian Dilakukan
                  </span>
                  <span className="text-xs font-medium text-primary-300">
                    {searchCount}x
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-900/40">
                  <span className="text-xs text-surface-200/60">
                    Bantuan AI
                  </span>
                  <span className="text-xs font-medium text-accent-400">
                    {sokraticCount}x
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 btn-secondary text-sm"
                >
                  Kembali
                </button>
                <Link href="/dashboard" className="flex-1 btn-primary text-sm text-center">
                  <span>Lihat Dashboard</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
