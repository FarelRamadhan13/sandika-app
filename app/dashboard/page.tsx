"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  GraduationCap,
  Building2,
  IdCard,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface StudentScore {
  id: string;
  sessionId: string;
  scenarioId: string;
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

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  school: string;
  grade: string;
  studentIdNumber: string;
  bio: string;
  createdAt: number;
  updatedAt: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [scores, setScores] = useState<StudentScore[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingScores, setIsLoadingScores] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [editForm, setEditForm] = useState({
    displayName: "",
    school: "",
    grade: "",
    studentIdNumber: "",
    bio: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchProfile = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`/api/user/profile?uid=${user.uid}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setEditForm({
          displayName: data.profile.displayName || user.displayName || "",
          school: data.profile.school || "",
          grade: data.profile.grade || "",
          studentIdNumber: data.profile.studentIdNumber || "",
          bio: data.profile.bio || "",
        });
      }
    } catch (err) {
      console.error("Gagal memuat profil siswa:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user]);

  const fetchMyScores = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoadingScores(true);
    try {
      const res = await fetch(`/api/score?userId=${user.uid}`);
      const data = await res.json();
      setScores(data.scores || []);
    } catch (err) {
      console.error("Gagal memuat skor siswa:", err);
      setScores([]);
    } finally {
      setIsLoadingScores(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMyScores();
    }
  }, [user, fetchProfile, fetchMyScores]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSavingProfile(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setSaveSuccessMsg("Data pribadi berhasil diperbarui di Firebase!");
        setTimeout(() => {
          setSaveSuccessMsg("");
          setIsEditModalOpen(false);
        }, 1500);
        // Refresh scores so display name is synced
        fetchMyScores();
      }
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (authLoading || (isLoadingProfile && !profile)) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-3 bg-surface-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        <p className="text-sm text-surface-200/60 font-medium">
          Menghubungkan ke Firebase...
        </p>
      </div>
    );
  }

  if (!user) return null;

  // Real statistics calculated directly from Firebase Firestore data
  const totalSessions = scores.length;
  const bestScore =
    scores.length > 0 ? Math.max(...scores.map((s) => s.totalScore)) : 0;
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + s.totalScore, 0) / scores.length)
      : 0;
  const avgAccuracy =
    scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + s.accuracy, 0) / scores.length)
      : 0;
  const totalTime = scores.reduce((a, s) => a + s.completionTimeSeconds, 0);
  const graphFoundCount = scores.filter((s) => s.graphDiscovered).length;
  const totalSearches = scores.reduce((a, s) => a + s.searchesPerformed, 0);
  const totalSokratic = scores.reduce((a, s) => a + s.sokraticInteractions, 0);

  const isProfileComplete = Boolean(
    profile?.school && profile?.grade && (profile?.displayName || user.displayName)
  );

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

  // Student individual competency radar chart
  const studentRadarData = [
    {
      skill: "Analisis Grafik",
      value:
        totalSessions > 0
          ? Math.round((graphFoundCount / totalSessions) * 100)
          : 0,
    },
    {
      skill: "Lacak Fakta",
      value: totalSessions > 0 ? Math.min(totalSearches * 15, 100) : 0,
    },
    {
      skill: "Deteksi Falasi",
      value: avgAccuracy,
    },
    {
      skill: "Kemandirian",
      value:
        totalSessions > 0
          ? Math.max(100 - Math.round((totalSokratic / totalSessions) * 15), 20)
          : 0,
    },
    {
      skill: "Efisiensi Waktu",
      value:
        totalSessions > 0
          ? Math.min(
              Math.max(
                100 - Math.round(totalTime / totalSessions / 10),
                20
              ),
              100
            )
          : 0,
    },
  ];

  const userInitials = (profile?.displayName || user.displayName || "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen pt-20 bg-surface-950 pb-16">
      {/* Top Banner / Student Identity Header */}
      <div className="glass-strong border-b border-primary-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg shadow-primary-500/20 shrink-0">
                  {userInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-surface-950 flex items-center justify-center" title="Online & Terhubung ke Firebase" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-surface-50">
                    {profile?.displayName || user.displayName || "Investigator"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/15 text-primary-300 border border-primary-500/30">
                    Siswa Investigator
                  </span>
                </div>

                <p className="text-sm text-surface-200/60 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{user.email}</span>
                  {profile?.school && (
                    <>
                      <span className="text-surface-200/30">•</span>
                      <span className="flex items-center gap-1 text-primary-300/90 font-medium">
                        <Building2 className="w-3.5 h-3.5" />
                        {profile.school}
                      </span>
                    </>
                  )}
                  {profile?.grade && (
                    <>
                      <span className="text-surface-200/30">•</span>
                      <span className="flex items-center gap-1 text-accent-300/90 font-medium">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {profile.grade}
                      </span>
                    </>
                  )}
                </p>

                {profile?.bio && (
                  <p className="text-xs text-surface-200/50 italic mt-2 max-w-xl">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary text-sm flex items-center gap-2 !py-2.5 !px-4"
              >
                <Edit3 className="w-4 h-4 text-primary-400" />
                <span>Ubah Data Pribadi</span>
              </button>

              <Link
                href="/sandbox"
                className="btn-primary text-sm flex items-center gap-2 !py-2.5 !px-5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mulai Investigasi</span>
              </Link>
            </div>
          </div>

          {/* Profile Completion Alert */}
          {!isProfileComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">
                    Data Pribadi Sekolah Belum Lengkap
                  </p>
                  <p className="text-xs text-amber-200/70">
                    Lengkapi asal sekolah dan kelas Anda agar hasil investigasi terdaftar resmi di laporan pendidik.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-surface-950 hover:bg-amber-400 transition-colors shrink-0"
              >
                Lengkapi Sekarang
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Personal Data Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-surface-50 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-primary-400 shrink-0" />
              Data Pribadi Siswa (Tersinkronisasi Firebase)
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 self-start sm:self-auto shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cloud Firestore Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
              <p className="text-xs text-surface-200/50 mb-1">Nama Lengkap</p>
              <p className="text-sm font-semibold text-surface-100">
                {profile?.displayName || user.displayName || "-"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
              <p className="text-xs text-surface-200/50 mb-1">Asal Sekolah</p>
              <p className="text-sm font-semibold text-surface-100">
                {profile?.school || (
                  <span className="text-amber-400/80 font-normal">
                    Belum diisi
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
              <p className="text-xs text-surface-200/50 mb-1">Kelas / Tingkat</p>
              <p className="text-sm font-semibold text-surface-100">
                {profile?.grade || (
                  <span className="text-amber-400/80 font-normal">
                    Belum diisi
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-900/60 border border-primary-500/10">
              <p className="text-xs text-surface-200/50 mb-1">
                NISN / ID Siswa
              </p>
              <p className="text-sm font-semibold text-surface-100 font-mono">
                {profile?.studentIdNumber || (
                  <span className="text-surface-200/40 font-normal">
                    Tidak ada
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Real Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              icon: Zap,
              label: "Total Sesi Selesai",
              value: totalSessions,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              desc: "Simulasi diselesaikan",
            },
            {
              icon: Trophy,
              label: "Skor Tertinggi",
              value: bestScore,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              desc: `Rata-rata: ${avgScore} poin`,
            },
            {
              icon: Target,
              label: "Akurasi Deteksi",
              value: `${avgAccuracy}%`,
              color: "text-green-400",
              bg: "bg-green-500/10",
              desc: "Akurasi identifikasi falasi",
            },
            {
              icon: Clock,
              label: "Total Waktu Investigasi",
              value: formatTime(totalTime),
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              desc: "Waktu berpikir kritis",
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
                <p className="text-xs font-semibold text-surface-200/70 mt-1">
                  {stat.label}
                </p>
                <p className="text-[11px] text-surface-200/40 mt-0.5">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* Visual Charts & Skill Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6 lg:col-span-1 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-surface-50 mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-400" />
                Peta Kemampuan Kritis
              </h3>
              <p className="text-xs text-surface-200/50 mb-4">
                Analisis 5 pilar investigasi berdasarkan data riil Anda
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={studentRadarData}>
                  <PolarGrid stroke="rgba(59,130,246,0.15)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    tick={{ fill: "#64748b", fontSize: 9 }}
                    domain={[0, 100]}
                  />
                  <Radar
                    name="Performa Siswa"
                    dataKey="value"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs text-center text-surface-200/40 mt-2">
              {totalSessions > 0
                ? "Dihitung otomatis dari riwayat simulasi Firebase Anda"
                : "Selesaikan 1 sesi untuk melihat peta kemampuan"}
            </div>
          </motion.div>

          {/* Tools & Achievements breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-surface-50 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400 shrink-0" />
                  Pencapaian & Pemanfaatan Alat Investigasi
                </h3>
                <Link
                  href="/data-siswa"
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium transition-colors shrink-0"
                >
                  <Users className="w-3.5 h-3.5" />
                  Bandingkan dengan Kelas
                </Link>
              </div>

              {/* Achievement badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    icon: "📊",
                    title: "Ahli Manipulasi Grafik",
                    status: `${graphFoundCount}/${totalSessions} Terbongkar`,
                    unlocked: graphFoundCount > 0,
                  },
                  {
                    icon: "🔍",
                    title: "Pelacak Sumber Fakta",
                    status: `${totalSearches}x Penelusuran`,
                    unlocked: totalSearches > 0,
                  },
                  {
                    icon: "🎯",
                    title: "Akurasi Tajam 80%+",
                    status:
                      scores.some((s) => s.accuracy >= 80)
                        ? "Tercapai"
                        : "Belum",
                    unlocked: scores.some((s) => s.accuracy >= 80),
                  },
                  {
                    icon: "⚡",
                    title: "Investigator Gesit",
                    status:
                      scores.some((s) => s.completionTimeSeconds < 300)
                        ? "Tercapai (<5m)"
                        : "Belum",
                    unlocked: scores.some((s) => s.completionTimeSeconds < 300),
                  },
                ].map((ach) => (
                  <div
                    key={ach.title}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      ach.unlocked
                        ? "bg-primary-500/10 border-primary-500/25 shadow-sm"
                        : "bg-surface-900/40 border-surface-700/20 opacity-45"
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <p className="text-xs font-semibold text-surface-200 mt-2 line-clamp-1">
                      {ach.title}
                    </p>
                    <p
                      className={`text-[11px] mt-1 font-medium ${
                        ach.unlocked ? "text-primary-400" : "text-surface-200/40"
                      }`}
                    >
                      {ach.status}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tools stats bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-200/70 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-primary-400" />
                      Deteksi Sumbu Y Grafik (Baseline 0)
                    </span>
                    <span className="text-surface-100 font-semibold">
                      {totalSessions > 0
                        ? `${Math.round((graphFoundCount / totalSessions) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-900/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      style={{
                        width: `${
                          totalSessions > 0
                            ? (graphFoundCount / totalSessions) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-200/70 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-pink-400" />
                      Interaksi Asisten AI Sokratik
                    </span>
                    <span className="text-surface-100 font-semibold">
                      {totalSokratic} kali konsultasi
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-900/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(totalSokratic * 10, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-primary-500/10 flex items-center justify-between">
              <span className="text-xs text-surface-200/50">
                Ingin meningkatkan skor investigasi?
              </span>
              <Link
                href="/sandbox"
                className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
              >
                Buka Sandbox Sekarang <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Real Investigation History from Firebase */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold text-surface-50 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                Riwayat Sesi Investigasi Saya
              </h3>
              <p className="text-xs text-surface-200/50 mt-0.5">
                Data resmi hasil investigasi yang tersimpan di Firebase Firestore
              </p>
            </div>

            {scores.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20 self-start sm:self-auto shrink-0">
                {scores.length} Sesi Terdata
              </span>
            )}
          </div>

          {isLoadingScores ? (
            <div className="flex items-center justify-center py-12 gap-3 text-surface-200/50">
              <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
              <span>Memuat data investigasi dari Firebase...</span>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-primary-500/20 bg-surface-900/30">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4 text-primary-400">
                <Compass className="w-7 h-7" />
              </div>
              <h4 className="text-base font-semibold text-surface-100 mb-1">
                Belum Ada Riwayat Investigasi
              </h4>
              <p className="text-xs text-surface-200/60 max-w-md mx-auto mb-6">
                Anda belum pernah menyelesaikan simulasi sandbox. Uji ketajaman berpikir kritis Anda dengan membongkar artikel jurnalistik sintetis berbasis AI sekarang!
              </p>
              <Link
                href="/sandbox"
                className="btn-primary inline-flex items-center gap-2 text-sm !py-2.5 !px-5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mulai Investigasi Pertama</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-500/10 text-xs text-surface-200/50">
                    <th className="text-left py-3 px-4 font-medium">Sesi</th>
                    <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                    <th className="text-center py-3 px-4 font-medium">Skor Poin</th>
                    <th className="text-center py-3 px-4 font-medium">Akurasi</th>
                    <th className="text-center py-3 px-4 font-medium">Durasi</th>
                    <th className="text-center py-3 px-4 font-medium">Grafik</th>
                    <th className="text-center py-3 px-4 font-medium">
                      <Search className="w-3.5 h-3.5 inline mr-1" />
                      Cari
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      <Bot className="w-3.5 h-3.5 inline mr-1" />
                      AI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, idx) => (
                    <tr
                      key={score.id || idx}
                      className="border-b border-primary-500/5 hover:bg-primary-500/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary-500/10 text-primary-400 font-bold text-xs flex items-center justify-center">
                            #{scores.length - idx}
                          </span>
                          <span className="font-semibold text-surface-100 text-xs">
                            {score.scenarioId || "Simulasi Hoax"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-surface-200/70">
                        {formatDate(score.timestamp)}
                      </td>
                      <td className="text-center py-3 px-4 font-semibold text-surface-100">
                        {score.totalScore}
                        <span className="text-surface-200/40 text-xs font-normal">
                          /{score.maxScore}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            score.accuracy >= 70
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : score.accuracy >= 50
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {score.accuracy}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-xs font-mono text-surface-200/70">
                        {formatTime(score.completionTimeSeconds)}
                      </td>
                      <td className="text-center py-3 px-4">
                        {score.graphDiscovered ? (
                          <span className="text-green-400 font-medium text-xs">
                            ✅ Terbongkar
                          </span>
                        ) : (
                          <span className="text-surface-200/30 text-xs">
                            ❌ Luput
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 text-xs text-surface-200/70">
                        {score.searchesPerformed}x
                      </td>
                      <td className="text-center py-3 px-4 text-xs text-surface-200/70">
                        {score.sokraticInteractions}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Personal Data Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full relative"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-surface-200/50 hover:text-surface-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-50">
                    Ubah Data Pribadi Siswa
                  </h3>
                  <p className="text-xs text-surface-200/50">
                    Data disimpan langsung ke Cloud Firestore Firebase
                  </p>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.displayName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, displayName: e.target.value })
                    }
                    placeholder="Contoh: Farel Ramadhan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-200/70 mb-1">
                      Asal Sekolah / Institusi *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.school}
                      onChange={(e) =>
                        setEditForm({ ...editForm, school: e.target.value })
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
                      value={editForm.grade}
                      onChange={(e) =>
                        setEditForm({ ...editForm, grade: e.target.value })
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
                    value={editForm.studentIdNumber}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
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
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="Contoh: Selalu cek fakta sebelum percaya narasi sensasional."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 border border-primary-500/20 text-sm text-surface-100 focus:outline-none focus:border-primary-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn-secondary text-xs !py-2.5 !px-4"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan ke Firebase</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
