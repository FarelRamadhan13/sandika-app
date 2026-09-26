"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Trophy,
  Target,
  Clock,
  Zap,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Loader2,
  Bot,
  Search,
  Eye,
} from "lucide-react";

interface StudentScore {
  id: string;
  sessionId: string;
  scenarioId: string;
  studentName: string;
  userId?: string;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  completionTimeSeconds: number;
  graphDiscovered: boolean;
  searchesPerformed: number;
  sokraticInteractions: number;
  timestamp: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMyScores();
    }
  }, [user]);

  const fetchMyScores = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/score?userId=${user?.uid}`);
      const data = await res.json();
      setScores(data.scores || []);
    } catch {
      setScores([]);
    }
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!user) return null;

  // Stats
  const totalSessions = scores.length;
  const bestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.totalScore)) : 0;
  const avgAccuracy =
    scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + s.accuracy, 0) / scores.length)
      : 0;
  const totalTime = scores.reduce((a, s) => a + s.completionTimeSeconds, 0);
  const graphFoundCount = scores.filter((s) => s.graphDiscovered).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen pt-20 bg-surface-950">
      {/* Header */}
      <div className="glass-strong border-b border-primary-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user.displayName
                ? user.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-50">
                Halo, {user.displayName || "Investigator"}! 👋
              </h1>
              <p className="text-sm text-surface-200/50 mt-1">
                {user.email} • Dashboard Investigasi Pribadi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/sandbox"
            className="group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-primary-600/20 to-accent-500/10 border border-primary-500/20 hover:border-primary-500/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-50">
                  Mulai Investigasi Baru
                </h2>
                <p className="text-sm text-surface-200/50">
                  Bongkar narasi menyesatkan dari artikel sintetis
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              icon: Zap,
              label: "Total Sesi",
              value: totalSessions,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              icon: Trophy,
              label: "Skor Terbaik",
              value: bestScore,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              icon: Target,
              label: "Rata-rata Akurasi",
              value: `${avgAccuracy}%`,
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              icon: Clock,
              label: "Total Waktu",
              value: formatTime(totalTime),
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="metric-card">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-surface-50">
                  {stat.value}
                </p>
                <p className="text-xs text-surface-200/50 mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-surface-50 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            Pencapaian
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: "📊",
                label: "Grafik Terungkap",
                value: `${graphFoundCount}/${totalSessions}`,
                unlocked: graphFoundCount > 0,
              },
              {
                icon: "🔍",
                label: "Penelusuran",
                value: `${scores.reduce((a, s) => a + s.searchesPerformed, 0)}x`,
                unlocked: scores.some((s) => s.searchesPerformed > 0),
              },
              {
                icon: "🎯",
                label: "Akurasi 80%+",
                value: scores.filter((s) => s.accuracy >= 80).length > 0 ? "Tercapai" : "Belum",
                unlocked: scores.some((s) => s.accuracy >= 80),
              },
              {
                icon: "⚡",
                label: "Investigator Cepat",
                value: scores.filter((s) => s.completionTimeSeconds < 300).length > 0 ? "Tercapai" : "Belum",
                unlocked: scores.some((s) => s.completionTimeSeconds < 300),
              },
            ].map((achievement) => (
              <div
                key={achievement.label}
                className={`p-4 rounded-xl border text-center transition-all ${
                  achievement.unlocked
                    ? "bg-primary-500/8 border-primary-500/20"
                    : "bg-surface-900/40 border-surface-700/30 opacity-50"
                }`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <p className="text-xs font-medium text-surface-200 mt-2">
                  {achievement.label}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    achievement.unlocked
                      ? "text-primary-400"
                      : "text-surface-200/40"
                  }`}
                >
                  {achievement.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Investigation History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-surface-50 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Riwayat Investigasi
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-surface-200/20 mx-auto mb-3" />
              <p className="text-surface-200/50 text-sm">
                Belum ada investigasi. Mulai investigasi pertamamu!
              </p>
              <Link
                href="/sandbox"
                className="btn-primary inline-flex items-center gap-2 text-sm mt-4"
              >
                <span>🔍 Mulai Sekarang</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, idx) => (
                <div
                  key={score.id || idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-900/40 border border-primary-500/5 hover:border-primary-500/15 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-sm font-bold text-primary-400">
                      #{scores.length - idx}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-50">
                        Sesi Investigasi
                      </p>
                      <p className="text-xs text-surface-200/40">
                        {formatDate(score.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-surface-200/50">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {score.graphDiscovered ? "✅" : "❌"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {score.searchesPerformed}x
                      </span>
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {score.sokraticInteractions}x
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-surface-50">
                        {score.totalScore}
                        <span className="text-surface-200/40 font-normal">
                          /{score.maxScore}
                        </span>
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          score.accuracy >= 70
                            ? "text-green-400"
                            : score.accuracy >= 50
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {score.accuracy}% akurasi
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
