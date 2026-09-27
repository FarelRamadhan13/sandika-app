"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  IdCard,
  Building2,
  GraduationCap,
  Loader2,
  CheckCircle2,
  Save,
  ArrowRight,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertCircle,
  X,
  Compass,
  Newspaper,
  Wrench,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "graph", label: "Grafik", icon: BarChart3, emoji: "📊" },
  { id: "search", label: "Lacak Balik", icon: Search, emoji: "🔍" },
  { id: "chat", label: "AI Sokratik", icon: Bot, emoji: "🤖" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface UserProfileData {
  displayName: string;
  school: string;
  grade: string;
  studentIdNumber: string;
  bio: string;
}

const TOPIC_PRESETS = [
  {
    label: "Kesehatan & Medis",
    value: "Kesehatan: Air Alkali Kristal Ajaib Sembuhkan Kanker & Diabetes",
    desc: "Klaim terapi instan tanpa obat medis",
    icon: "🩺",
  },
  {
    label: "Teknologi & AI",
    value: "Teknologi: AI Generatif Menyebabkan Kepunahan 90% Desainer Visual",
    desc: "Manipulasi data ancaman ketenagakerjaan",
    icon: "🤖",
  },
  {
    label: "Lingkungan & Iklim",
    value: "Lingkungan: Penemuan Data Suhu Bumi Menurun Drastis 5 Tahun",
    desc: "Cherry-picking rentang waktu iklim",
    icon: "🌍",
  },
  {
    label: "Ekonomi & Kripto",
    value: "Ekonomi: Robot Trading Kripto Garansi Profit Pasti 300% per Bulan",
    desc: "Skema ponzi berkedok algoritma cerdas",
    icon: "💰",
  },
  {
    label: "Pangan & Nutrisi",
    value: "Pangan: Temuan Beras Plastik Sintetis Beredar Bebas di Pasaran",
    desc: "Hoaks pangan berbahaya tanpa uji lab",
    icon: "🧪",
  },
];

export default function SandboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Scenarios state
  const [scenarios, setScenarios] = useState<Scenario[]>(
    scenariosData.scenarios as Scenario[]
  );
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);
  const [isScenarioSelectorOpen, setIsScenarioSelectorOpen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<"article" | "tools">(
    "article"
  );

  // Active scenario
  const scenario: Scenario =
    scenarios[selectedScenarioIndex] ||
    (scenariosData.scenarios[0] as Scenario);

  // AI Scenario Generator modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(TOPIC_PRESETS[0].value);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generationDifficulty, setGenerationDifficulty] = useState("Menengah");
  const [generatorError, setGeneratorError] = useState("");

  // Sandbox investigation state
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
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [sessionKey, setSessionKey] = useState(0);

  // Modals state
  const [showPersonalDataModal, setShowPersonalDataModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile from Firebase
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [personalFormData, setPersonalFormData] = useState({
    studentName: "",
    school: "",
    grade: "",
    studentIdNumber: "",
    bio: "",
  });

  // Protect route: require login so students cannot access anonymously
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/sandbox");
    }
  }, [user, authLoading, router]);

  // Fetch scenarios from API (base JSON + Firebase AI-generated scenarios)
  const fetchScenarios = useCallback(async () => {
    setIsLoadingScenarios(true);
    try {
      const res = await fetch("/api/scenarios");
      const data = await res.json();
      if (data.success && data.scenarios?.length > 0) {
        setScenarios(data.scenarios);
      }
    } catch (err) {
      console.warn("Gagal memuat skenario dari API:", err);
    } finally {
      setIsLoadingScenarios(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // Fetch user profile if logged in
  useEffect(() => {
    if (user?.uid) {
      fetch(`/api/user/profile?uid=${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            setUserProfile(data.profile);
            setPersonalFormData({
              studentName: data.profile.displayName || user.displayName || "",
              school: data.profile.school || "",
              grade: data.profile.grade || "",
              studentIdNumber: data.profile.studentIdNumber || "",
              bio: data.profile.bio || "",
            });
          }
        })
        .catch((err) =>
          console.error("Gagal memuat profil pengguna di sandbox:", err)
        );
    }
  }, [user]);

  // Timer - only run when student is authenticated and timer is active
  useEffect(() => {
    if (!user || !isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, user, isTimerRunning]);

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

  // Handler to switch selected scenario
  const handleSelectScenario = (index: number) => {
    setIsScenarioSelectorOpen(false);
    if (index === selectedScenarioIndex) return;
    setSelectedScenarioIndex(index);
    setHighlights([]);
    setGraphDiscovered(false);
    setSearchCount(0);
    setSokraticCount(0);
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    setIsTimerRunning(true);
    setSessionKey((prev) => prev + 1);
    setMobileActiveView("article");
  };

  // Handler to generate new scenario via Gemini AI API
  const handleGenerateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratorError("");

    try {
      const topicToGenerate = customPrompt.trim()
        ? customPrompt
        : selectedPreset;

      const res = await fetch("/api/scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToGenerate,
          category: topicToGenerate.split(":")[0]?.trim() || "Umum",
          difficulty: generationDifficulty,
          customPrompt,
        }),
      });

      const data = await res.json();
      if (data.success && data.scenario) {
        setScenarios((prev) => [data.scenario, ...prev]);
        setSelectedScenarioIndex(0);
        // Reset state for newly generated scenario
        setHighlights([]);
        setGraphDiscovered(false);
        setSearchCount(0);
        setSokraticCount(0);
        const now = Date.now();
        setStartTime(now);
        setElapsedTime(0);
        setIsTimerRunning(true);
        setSessionKey((prev) => prev + 1);
        setIsGeneratorOpen(false);
        setCustomPrompt("");
      } else {
        setGeneratorError(
          data.error || "Gagal membuat skenario. Silakan coba lagi."
        );
      }
    } catch {
      setGeneratorError("Terjadi kesalahan jaringan saat membuat skenario AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextSelect = useCallback(
    (_text: string, _paragraphId: string) => {
      // Handled by event listener
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
  const correctHighlights = highlights.filter(
    (h) => h.isCorrect === true
  ).length;
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

  // Reset sandbox completely
  const handleResetSandbox = () => {
    setShowResults(false);
    setHighlights([]);
    setGraphDiscovered(false);
    setSearchCount(0);
    setSokraticCount(0);
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    setIsTimerRunning(true);
    setSessionKey((prev) => prev + 1);
    setActiveTab("graph");
    setMobileActiveView("article");
  };

  // Save score and personal data to Firebase
  const commitSaveToFirebase = async (
    dataToSave: {
      studentName: string;
      school: string;
      grade: string;
      studentIdNumber: string;
      bio: string;
    },
    forcedElapsedTime?: number
  ) => {
    setIsSaving(true);
    const timeToSave =
      forcedElapsedTime !== undefined ? forcedElapsedTime : elapsedTime;

    try {
      if (user?.uid) {
        await fetch("/api/user/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            displayName: dataToSave.studentName,
            email: user.email,
            school: dataToSave.school,
            grade: dataToSave.grade,
            studentIdNumber: dataToSave.studentIdNumber,
            bio: dataToSave.bio,
          }),
        });
      }

      await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          studentName:
            dataToSave.studentName || user?.displayName || "Investigator",
          userId: user?.uid || "",
          email: user?.email || "",
          school: dataToSave.school || "",
          grade: dataToSave.grade || "",
          studentIdNumber: dataToSave.studentIdNumber || "",
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
          completionTimeSeconds: timeToSave,
        }),
      });
    } catch (err) {
      console.error("Gagal menyimpan data ke Firebase:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    // 1. Hentikan waktu seketika saat tombol selesai ditekan
    setIsTimerRunning(false);
    const finalElapsed = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(finalElapsed);

    const hasPersonalDataInFirebase = Boolean(
      userProfile?.school &&
        userProfile?.grade &&
        (userProfile?.displayName || user?.displayName)
    );

    if (hasPersonalDataInFirebase && userProfile) {
      await commitSaveToFirebase(
        {
          studentName: userProfile.displayName || user?.displayName || "",
          school: userProfile.school || "",
          grade: userProfile.grade || "",
          studentIdNumber: userProfile.studentIdNumber || "",
          bio: userProfile.bio || "",
        },
        finalElapsed
      );
      setShowResults(true);
    } else {
      setShowPersonalDataModal(true);
    }
  };

  const handlePersonalDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await commitSaveToFirebase(personalFormData, elapsedTime);
    setShowPersonalDataModal(false);
    setShowResults(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-3 bg-surface-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        <p className="text-sm text-surface-200/60 font-medium">
          Memverifikasi sesi siswa...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4 bg-surface-950">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-primary-500/20 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-surface-50 mb-2">
            Login Siswa Diperlukan
          </h2>
          <p className="text-sm text-surface-200/60 mb-6 leading-relaxed">
            Untuk memulai simulasi investigasi sandbox dan memastikan data statistik investigasi tersimpan ke akun Firebase Anda, silakan masuk sebagai siswa terlebih dahulu. Siswa tidak dapat mengakses secara anonim.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login?redirect=/sandbox"
              className="btn-primary text-sm !py-3 flex items-center justify-center gap-2 font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Sebagai Siswa</span>
            </Link>
            <Link
              href="/register?redirect=/sandbox"
              className="btn-secondary text-sm !py-3 flex items-center justify-center gap-2 font-medium"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun Siswa Baru</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-surface-200/40 hover:text-surface-200/70 transition-colors mt-2"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-surface-950 pb-12">
      {/* Top Bar with Timer, Score & Actions */}
      <div className="sticky top-16 md:top-20 z-30 bg-surface-950/95 backdrop-blur-md border-b border-primary-500/20 shadow-lg shadow-black/40">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* Main row: Title & Primary Actions */}
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Link
                href="/"
                className="p-1.5 rounded-lg hover:bg-primary-500/10 transition-colors shrink-0 text-surface-200/70 hover:text-surface-100"
                title="Kembali ke Beranda"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xs sm:text-sm font-semibold text-surface-50 truncate">
                    {scenario.title}
                  </h1>
                  {scenario.isAiGenerated && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Gemini
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-surface-200/50 mt-0.5 truncate hidden sm:block">
                  {scenario.category} • Tingkat {scenario.difficulty} • {scenario.totalFallacies} Falasi Tersembunyi
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Toggle Scenario Drawer Button */}
              <button
                onClick={() => setIsScenarioSelectorOpen(!isScenarioSelectorOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isScenarioSelectorOpen
                    ? "bg-primary-500/20 border-primary-500/40 text-primary-300"
                    : "bg-surface-900 border-primary-500/15 text-surface-200 hover:text-surface-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-primary-400" />
                <span>Pilih Kasus</span>
                {isScenarioSelectorOpen ? (
                  <ChevronUp className="w-3 h-3 ml-0.5" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                )}
              </button>

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
                disabled={isSaving}
                className="btn-primary text-xs !py-2 !px-4"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Target className="w-3 h-3" />
                  )}
                  Selesai
                </span>
              </button>
            </div>

            {/* Mobile Finish button on Row 1 */}
            <div className="md:hidden shrink-0">
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="btn-primary text-xs !py-1.5 !px-3 shadow-md"
              >
                <span className="flex items-center gap-1 font-semibold">
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Target className="w-3 h-3" />
                  )}
                  Selesai
                </span>
              </button>
            </div>
          </div>

          {/* Row 2 on Mobile: Case Selector Button, Timer, Score */}
          <div className="md:hidden flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-primary-500/10">
            <button
              onClick={() => setIsScenarioSelectorOpen(!isScenarioSelectorOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                isScenarioSelectorOpen
                  ? "bg-primary-500/20 border-primary-500/40 text-primary-300"
                  : "bg-surface-900 border-primary-500/15 text-surface-200"
              }`}
            >
              <Layers className="w-3 h-3 text-primary-400" />
              <span>Kasus #{selectedScenarioIndex + 1}</span>
              {isScenarioSelectorOpen ? (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-2">
              {/* Timer Pill */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800/90 border border-primary-500/15">
                <Clock className="w-3 h-3 text-primary-400" />
                <span className="text-[11px] font-mono text-surface-100 font-semibold">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              {/* Score Pill */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800/90 border border-primary-500/15">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-mono text-surface-100 font-semibold">
                  {totalScore}/{maxScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: SCENARIO CARDS & GEMINI AI GENERATOR CAROUSEL */}
      <AnimatePresence>
        {isScenarioSelectorOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-primary-500/20 bg-surface-900 overflow-hidden shadow-inner"
          >
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                  <h2 className="text-xs font-bold text-surface-100 uppercase tracking-wider">
                    Pilih Studi Kasus ({scenarios.length} Kasus Tersedia)
                  </h2>
                </div>

                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="btn-primary text-xs !py-1.5 !px-3.5 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-500 hover:to-primary-500 shadow-sm self-stretch sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate dengan Gemini AI</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Special Card: Generate with Gemini AI */}
                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="p-4 rounded-xl border border-dashed border-purple-500/40 hover:border-purple-400/80 bg-purple-500/5 hover:bg-purple-500/10 transition-all flex flex-col justify-between text-left group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-2.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-surface-100 group-hover:text-purple-300 transition-colors">
                      + Generate Skenario Baru
                    </h3>
                    <p className="text-[11px] text-surface-200/60 mt-1 leading-relaxed">
                      Manfaatkan AI Gemini untuk menciptakan skenario artikel berita sintetis unik sesuai topik pilihanmu.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                    <span>Mulai Generate AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Scenario Cards */}
                {scenarios.map((sc, idx) => {
                  const isCurrent = idx === selectedScenarioIndex;
                  return (
                    <div
                      key={sc.id || idx}
                      onClick={() => handleSelectScenario(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left relative overflow-hidden ${
                        isCurrent
                          ? "bg-primary-500/15 border-primary-500/60 shadow-lg shadow-primary-900/20 ring-1 ring-primary-500/40"
                          : "bg-surface-900/80 border-surface-800 hover:border-primary-500/30 hover:bg-surface-900"
                      }`}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20 truncate">
                            {sc.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-800 text-surface-200/70 border border-surface-700/40 shrink-0">
                            {sc.difficulty}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-surface-100 line-clamp-2 mb-1.5 leading-snug">
                          {sc.title}
                        </h3>

                        <p className="text-[10px] text-surface-200/50 line-clamp-1">
                          {sc.article?.source || "Portal Berita Sintetis"}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-3 pt-2.5 border-t border-primary-500/10 flex items-center justify-between text-[11px]">
                        <span className="text-surface-200/60">
                          {sc.totalFallacies} Falasi Logika
                        </span>

                        {isCurrent ? (
                          <span className="flex items-center gap-1 font-bold text-primary-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="text-surface-200/40 hover:text-primary-300 transition-colors">
                            Pilih Kasus &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Segmented Switcher (Artikel vs Alat Investigasi) */}
      <div className="lg:hidden max-w-[1600px] mx-auto px-3 sm:px-4 pt-3 pb-1">
        <div className="flex p-1 rounded-xl bg-surface-900 border border-primary-500/20 shadow-md">
          <button
            type="button"
            onClick={() => setMobileActiveView("article")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileActiveView === "article"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-surface-200/60 hover:text-surface-100"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Artikel ({highlights.length} Sorotan)</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView("tools")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileActiveView === "tools"
                ? "bg-gradient-to-r from-purple-600 to-primary-600 text-white shadow-sm"
                : "text-surface-200/60 hover:text-surface-100"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Alat Investigasi</span>
            {graphDiscovered && (
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Main Investigation Workspace */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
          {/* Left: Article Panel */}
          <div className={`lg:col-span-3 ${mobileActiveView === "tools" ? "hidden lg:block" : "block"}`}>
            <ArticlePanel
              key={`article-${scenario.id}-${sessionKey}`}
              article={scenario.article}
              onTextSelect={handleTextSelect}
              highlights={highlights}
            />

            {/* Mobile quick switch to tools */}
            <div className="lg:hidden mt-4 pt-3 border-t border-primary-500/10">
              <button
                type="button"
                onClick={() => setMobileActiveView("tools")}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-primary-600/20 border border-primary-500/30 text-primary-200 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary-500/30 transition-all"
              >
                <Wrench className="w-4 h-4 text-primary-400" />
                <span>Buka Alat Investigasi (Grafik, Lacak, AI) &rarr;</span>
              </button>
            </div>
          </div>

          {/* Right: Tools Panel */}
          <div className={`lg:col-span-2 flex flex-col lg:sticky lg:top-[140px] lg:h-[calc(100vh-155px)] lg:min-h-[580px] min-h-0 ${
            mobileActiveView === "article" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Mobile quick switch back to article */}
            <div className="lg:hidden mb-2.5">
              <button
                type="button"
                onClick={() => setMobileActiveView("article")}
                className="w-full py-2 px-3 rounded-xl bg-surface-900 border border-surface-700/60 text-surface-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-surface-800 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-surface-400" />
                <span>Kembali Baca Teks Artikel</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex gap-1 mb-2.5 p-1 rounded-xl bg-surface-900/50 border border-primary-500/10">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id ? "tab-active font-semibold shadow-sm" : "tab-inactive"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tool content */}
            <div className="tool-panel rounded-2xl p-3.5 sm:p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
              {activeTab === "graph" && (
                <GraphTool
                  key={`graph-${scenario.id}-${sessionKey}`}
                  graphConfig={scenario.graphData}
                  onDiscovered={handleGraphDiscovered}
                />
              )}
              {activeTab === "search" && (
                <ReverseSearch
                  key={`search-${scenario.id}-${sessionKey}`}
                  searchDatabase={scenario.searchDatabase}
                  onSearch={handleSearch}
                />
              )}
              {activeTab === "chat" && (
                <SokraticChat
                  key={`chat-${scenario.id}-${sessionKey}`}
                  scenario={scenario}
                  scenarioId={scenario.id}
                  hints={scenario.sokraticHints}
                  onInteraction={handleSokraticInteraction}
                />
              )}
            </div>

            {/* Score Summary */}
            <div className="shrink-0 mt-2.5 grid grid-cols-3 gap-2">
              <div className="text-center py-2 px-1 rounded-xl bg-surface-900/50 border border-primary-500/10">
                <Highlighter className="w-3.5 h-3.5 text-primary-400 mx-auto mb-0.5" />
                <p className="text-base font-bold text-surface-50 leading-tight">
                  {highlights.length}
                </p>
                <p className="text-[9px] text-surface-200/50 uppercase tracking-wider">Sorotan</p>
              </div>
              <div className="text-center py-2 px-1 rounded-xl bg-surface-900/50 border border-primary-500/10">
                <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-0.5" />
                <p className="text-base font-bold text-surface-50 leading-tight">
                  {accuracy}%
                </p>
                <p className="text-[9px] text-surface-200/50 uppercase tracking-wider">Akurasi</p>
              </div>
              <div className="text-center py-2 px-1 rounded-xl bg-surface-900/50 border border-primary-500/10">
                <Bot className="w-4 h-4 text-accent-400 mx-auto mb-0.5" />
                <p className="text-base font-bold text-surface-50 leading-tight">
                  {sokraticCount}
                </p>
                <p className="text-[9px] text-surface-200/50 uppercase tracking-wider">Chat AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: GEMINI AI SCENARIO GENERATOR */}
      <AnimatePresence>
        {isGeneratorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl p-6 sm:p-8 max-w-xl w-full relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="absolute top-4 right-4 p-2 text-surface-200/50 hover:text-surface-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                    Generator Skenario AI
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Gemini 2.5 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-surface-200/60 mt-0.5">
                    Buat studi kasus baru dengan artikel berita sintetis, falasi logika, dan grafik manipulatif secara otomatis.
                  </p>
                </div>
              </div>

              {generatorError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{generatorError}</span>
                </div>
              )}

              <form onSubmit={handleGenerateScenario} className="space-y-4">
                {/* Topic Presets */}
                <div>
                  <label className="block text-xs font-semibold text-surface-200/80 mb-2">
                    Pilih Topik Skenario Studi Kasus
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TOPIC_PRESETS.map((preset) => {
                      const isSelected = selectedPreset === preset.value && !customPrompt;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(preset.value);
                            setCustomPrompt("");
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-purple-500/15 border-purple-500/50 text-surface-50 ring-1 ring-purple-500/30"
                              : "bg-surface-900/60 border-surface-800 text-surface-200/70 hover:border-surface-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{preset.icon}</span>
                            <span className="text-xs font-bold text-surface-100">
                              {preset.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-surface-200/50 mt-1 line-clamp-1">
                            {preset.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-xs font-semibold text-surface-200/80 mb-1">
                    Atau Ketik Topik Kustom Anda Sendiri (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Contoh: Klaim Radiasi 5G Menyebabkan Mutasi Genetik pada Tanaman"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 placeholder-surface-200/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-semibold text-surface-200/80 mb-1">
                    Tingkat Kesulitan Investigasi
                  </label>
                  <select
                    value={generationDifficulty}
                    onChange={(e) => setGenerationDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-purple-400"
                  >
                    <option value="Mudah">Mudah (Falasi Lebih Kentara & Mudah Terdeteksi)</option>
                    <option value="Menengah">Menengah (Standar Investigasi Sandbox)</option>
                    <option value="Sulit">Sulit (Falasi Halus & Menuntut Verifikasi Mendalam)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-[11px] text-surface-200/60 leading-relaxed">
                  💡 <strong>Info:</strong> Model Gemini AI akan otomatis meracik artikel berita investigasi baru secara dinamis menggunakan API key sistem, menyusupkan falasi logika tersembunyi, merancang data grafik termanipulasi, dan menyusun database pencarian fakta untuk dibongkar di sandbox.
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGeneratorOpen(false)}
                    disabled={isGenerating}
                    className="btn-secondary text-xs !py-2.5 !px-4"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary text-xs !py-2.5 !px-5 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-500 hover:to-primary-500 flex items-center gap-2 font-semibold shadow-lg shadow-purple-500/20"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyusun Skenario dengan AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Skenario Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 1: Input & Save Personal Data to Firebase */}
      <AnimatePresence>
        {showPersonalDataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl p-4 sm:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                  <IdCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-surface-50">
                    Simpan Data Pribadi Siswa
                  </h3>
                  <p className="text-xs text-surface-200/60 mt-0.5">
                    Data pribadi Anda belum tercatat di Firebase. Lengkapi untuk menyimpan hasil investigasi ke Dashboard Mandiri.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePersonalDataSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={personalFormData.studentName}
                    onChange={(e) =>
                      setPersonalFormData({
                        ...personalFormData,
                        studentName: e.target.value,
                      })
                    }
                    placeholder="Contoh: Farel Ramadhan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                      Asal Sekolah / Madrasah *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalFormData.school}
                      onChange={(e) =>
                        setPersonalFormData({
                          ...personalFormData,
                          school: e.target.value,
                        })
                      }
                      placeholder="Contoh: SMAN 1 Jakarta"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                      Kelas / Tingkat *
                    </label>
                    <input
                      type="text"
                      required
                      value={personalFormData.grade}
                      onChange={(e) =>
                        setPersonalFormData({
                          ...personalFormData,
                          grade: e.target.value,
                        })
                      }
                      placeholder="Contoh: Kelas 11 IPA"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                    NISN / Nomor Induk Siswa (Opsional)
                  </label>
                  <input
                    type="text"
                    value={personalFormData.studentIdNumber}
                    onChange={(e) =>
                      setPersonalFormData({
                        ...personalFormData,
                        studentIdNumber: e.target.value,
                      })
                    }
                    placeholder="Contoh: 0078291038"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                    Motto / Bio Investigasi (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={personalFormData.bio}
                    onChange={(e) =>
                      setPersonalFormData({
                        ...personalFormData,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Contoh: Berpikir kritis sebelum menyebarkan berita."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPersonalDataModal(false);
                      setStartTime(Date.now() - elapsedTime * 1000);
                      setIsTimerRunning(true);
                    }}
                    className="btn-secondary text-xs !py-2.5 !px-4"
                  >
                    Kembali ke Sandbox
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan ke Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan & Lihat Hasil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Results Modal with Firebase Confirmation & Dashboard Link */}
      <AnimatePresence>
        {showResults && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="glass-card rounded-2xl p-4 sm:p-8 max-w-md w-full text-center max-h-[90vh] overflow-y-auto"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-primary-500/20">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-surface-50 mb-1">
                Investigasi Selesai!
              </h2>

              {/* Verified Firebase Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-medium my-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Data Pribadi & Skor Tersimpan di Firebase
              </div>

              {/* Student identification badge */}
              <div className="p-3 my-3 rounded-xl bg-surface-900/60 border border-primary-500/10 text-left text-xs">
                <p className="font-semibold text-surface-100 flex items-center gap-1.5 truncate">
                  <IdCard className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                  <span className="truncate">
                    {personalFormData.studentName ||
                      userProfile?.displayName ||
                      user?.displayName ||
                      "Investigator Siswa"}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-surface-200/60 mt-1">
                  {(personalFormData.school || userProfile?.school) && (
                    <span className="flex items-center gap-1 truncate max-w-full">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{personalFormData.school || userProfile?.school}</span>
                    </span>
                  )}
                  {(personalFormData.grade || userProfile?.grade) && (
                    <span className="flex items-center gap-1 shrink-0">
                      <GraduationCap className="w-3 h-3 shrink-0" />
                      <span>{personalFormData.grade || userProfile?.grade}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-2xl font-bold text-gradient">
                    {totalScore}
                  </p>
                  <p className="text-[11px] text-surface-200/50">
                    dari {maxScore} poin
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-2xl font-bold text-gradient-accent">
                    {accuracy}%
                  </p>
                  <p className="text-[11px] text-surface-200/50">Akurasi</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-xl font-bold text-surface-50 font-mono">
                    {formatTime(elapsedTime)}
                  </p>
                  <p className="text-[11px] text-surface-200/50">Waktu</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-900/60 border border-primary-500/10">
                  <p className="text-xl font-bold text-surface-50">
                    {correctHighlights}/{scenario.totalFallacies}
                  </p>
                  <p className="text-[11px] text-surface-200/50">
                    Falasi Ditemukan
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-left mb-6 text-xs">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-900/40">
                  <span className="text-surface-200/60">
                    Grafik Baseline 0
                  </span>
                  <span
                    className={`font-semibold ${
                      graphDiscovered ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {graphDiscovered ? "✅ Terbongkar" : "❌ Luput"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-900/40">
                  <span className="text-surface-200/60">
                    Pencarian Mock Reverse
                  </span>
                  <span className="font-semibold text-primary-300">
                    {searchCount}x penelusuran
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-900/40">
                  <span className="text-surface-200/60">
                    Bimbingan AI Sokratik
                  </span>
                  <span className="font-semibold text-accent-400">
                    {sokraticCount}x interaksi
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleResetSandbox}
                  className="btn-secondary text-xs !py-2.5 flex-1"
                >
                  Tutup Hasil
                </button>
                <Link
                  href="/dashboard"
                  className="btn-primary text-xs !py-2.5 flex-1 flex items-center justify-center gap-1.5"
                >
                  <span>Lihat Dashboard Mandiri</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
