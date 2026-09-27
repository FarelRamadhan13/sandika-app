"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Users,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Bot,
  BarChart3,
  Eye,
  Search,
  RefreshCw,
  ChevronLeft,
  Building2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface StudentScore {
  id: string;
  studentName: string;
  userId?: string;
  school?: string;
  grade?: string;
  studentIdNumber?: string;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  completionTimeSeconds: number;
  graphDiscovered: boolean;
  searchesPerformed: number;
  sokraticInteractions: number;
  timestamp: number;
}

const COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

export default function DataSiswaPage() {
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScores = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/score");
      const data = await res.json();
      setScores(data.scores || []);
    } catch {
      setScores([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // Calculate metrics
  const totalStudents = scores.length;
  const avgAccuracy =
    totalStudents > 0
      ? Math.round(
          scores.reduce((acc, s) => acc + s.accuracy, 0) / totalStudents
        )
      : 0;
  const avgScore =
    totalStudents > 0
      ? Math.round(
          scores.reduce((acc, s) => acc + s.totalScore, 0) / totalStudents
        )
      : 0;
  const avgTime =
    totalStudents > 0
      ? Math.round(
          scores.reduce((acc, s) => acc + s.completionTimeSeconds, 0) /
            totalStudents
        )
      : 0;
  const graphDiscoveryRate =
    totalStudents > 0
      ? Math.round(
          (scores.filter((s) => s.graphDiscovered).length / totalStudents) * 100
        )
      : 0;
  const avgSokraticUsage =
    totalStudents > 0
      ? (
          scores.reduce((acc, s) => acc + s.sokraticInteractions, 0) /
          totalStudents
        ).toFixed(1)
      : "0";

  // Chart data
  const scoreDistribution = scores.map((s) => ({
    name: s.studentName.split(" ")[0],
    skor: s.totalScore,
    akurasi: s.accuracy,
  }));

  const radarData = [
    {
      skill: "Analisis Grafik",
      value: graphDiscoveryRate,
    },
    {
      skill: "Pencarian",
      value:
        totalStudents > 0
          ? Math.min(
              Math.round(
                (scores.reduce((a, s) => a + s.searchesPerformed, 0) /
                  totalStudents) *
                  15
              ),
              100
            )
          : 0,
    },
    {
      skill: "Sorot Falasi",
      value: avgAccuracy,
    },
    {
      skill: "Kemandirian",
      value:
        totalStudents > 0
          ? Math.max(100 - Number(avgSokraticUsage) * 15, 20)
          : 0,
    },
    {
      skill: "Kecepatan",
      value:
        totalStudents > 0
          ? Math.max(100 - Math.round(avgTime / 10), 20)
          : 0,
    },
  ];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-surface-950">
        <div className="flex items-center gap-3 text-surface-200/60 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-primary-400" />
          <span>Memuat data siswa dari Firebase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-surface-950 pb-16">
      {/* Header */}
      <div className="glass-strong border-b border-primary-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-primary-500/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-surface-200/60" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary-400 shrink-0" />
                  Data Seluruh Siswa
                </h1>
                <p className="text-sm text-surface-200/50 mt-1">
                  Metrik analitik kognitif investigasi siswa di Firebase
                </p>
              </div>
            </div>
            <button
              onClick={fetchScores}
              className="btn-secondary text-sm flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {scores.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl glass-card border border-primary-500/10 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 text-primary-400">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-surface-50 mb-2">
              Belum Ada Data Siswa di Firebase
            </h2>
            <p className="text-sm text-surface-200/60 mb-6">
              Belum ada siswa yang menyelesaikan investigasi sandbox. Mulai investigasi pertama Anda sekarang untuk mencatat data ke Firebase!
            </p>
            <Link
              href="/sandbox"
              className="btn-primary inline-flex items-center gap-2 text-sm !py-2.5 !px-5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Sandbox Investigasi</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
            >
              {[
                {
                  icon: Users,
                  label: "Total Sesi Siswa",
                  value: totalStudents,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: Trophy,
                  label: "Rata-rata Skor",
                  value: avgScore,
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
                  label: "Rata-rata Waktu",
                  value: formatTime(avgTime),
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
                {
                  icon: Eye,
                  label: "Grafik Terdeteksi",
                  value: `${graphDiscoveryRate}%`,
                  color: "text-violet-400",
                  bg: "bg-violet-500/10",
                },
                {
                  icon: Bot,
                  label: "Rata-rata Bantuan AI",
                  value: `${avgSokraticUsage}x`,
                  color: "text-pink-400",
                  bg: "bg-pink-500/10",
                },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="metric-card">
                    <div
                      className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-surface-50">
                      {metric.value}
                    </p>
                    <p className="text-xs text-surface-200/50 mt-1">
                      {metric.label}
                    </p>
                  </div>
                );
              })}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Score Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-surface-50 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  Distribusi Skor Siswa (Firebase)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(59,130,246,0.1)"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(148,163,184,0.5)"
                        fontSize={11}
                      />
                      <YAxis
                        stroke="rgba(148,163,184,0.5)"
                        fontSize={11}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(17,24,39,0.95)",
                          border: "1px solid rgba(59,130,246,0.2)",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="skor"
                        fill="url(#barGradient)"
                        radius={[6, 6, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Radar Heatmap */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-surface-50 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-400" />
                  Heatmap Kemampuan Kritis Kelas
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(59,130,246,0.15)" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        tick={{ fill: "#64748b", fontSize: 10 }}
                        domain={[0, 100]}
                      />
                      <Radar
                        name="Kelas"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Student Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-surface-50 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Detail Performa Siswa
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-500/10">
                      <th className="text-left py-3 px-4 text-surface-200/50 font-medium">
                        Nama & Asal Siswa
                      </th>
                      <th className="text-center py-3 px-4 text-surface-200/50 font-medium">
                        Skor
                      </th>
                      <th className="text-center py-3 px-4 text-surface-200/50 font-medium">
                        Akurasi
                      </th>
                      <th className="text-center py-3 px-4 text-surface-200/50 font-medium">
                        Waktu
                      </th>
                      <th className="text-center py-3 px-4 text-surface-200/50 font-medium">
                        <Search className="w-3 h-3 inline" /> Cari
                      </th>
                      <th className="text-center py-3 px-4 text-surface-200/50 font-medium">
                        <Bot className="w-3 h-3 inline" /> AI
                      </th>
                      <th className="text-center py-3 px-4 text-surface-200/50 font-medium">
                        Grafik
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((student, idx) => (
                      <tr
                        key={student.id || idx}
                        className="border-b border-primary-500/5 hover:bg-primary-500/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  COLORS[idx % COLORS.length]
                                }, ${COLORS[(idx + 1) % COLORS.length]})`,
                              }}
                            >
                              {student.studentName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-surface-100 block">
                                {student.studentName}
                              </span>
                              {(student.school || student.grade) && (
                                <span className="text-[11px] text-surface-200/50 flex items-center gap-1.5 mt-0.5">
                                  {student.school && (
                                    <span className="flex items-center gap-0.5">
                                      <Building2 className="w-3 h-3" />
                                      {student.school}
                                    </span>
                                  )}
                                  {student.grade && (
                                    <span className="flex items-center gap-0.5">
                                      <GraduationCap className="w-3 h-3" />
                                      {student.grade}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-semibold text-surface-50">
                            {student.totalScore}
                          </span>
                          <span className="text-surface-200/40">
                            /{student.maxScore}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`font-medium ${
                              student.accuracy >= 70
                                ? "text-green-400"
                                : student.accuracy >= 50
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {student.accuracy}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-surface-200/70 font-mono text-xs">
                          {formatTime(student.completionTimeSeconds)}
                        </td>
                        <td className="text-center py-3 px-4 text-surface-200/70">
                          {student.searchesPerformed}
                        </td>
                        <td className="text-center py-3 px-4 text-surface-200/70">
                          {student.sokraticInteractions}
                        </td>
                        <td className="text-center py-3 px-4">
                          {student.graphDiscovered ? (
                            <span className="text-green-400 font-medium text-xs">
                              ✅
                            </span>
                          ) : (
                            <span className="text-red-400/50 font-medium text-xs">
                              ❌
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
