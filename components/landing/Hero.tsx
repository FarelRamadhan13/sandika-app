"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Sparkles,
  Target,
  ChevronDown,
  BarChart3,
  Users,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="absolute inset-0 grid-pattern" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-800/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-accent-400" />
          <span className="text-sm text-primary-200 font-medium">
            Platform Edukasi Anti-Hoax Interaktif
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-surface-50">Latih Kemampuan</span>
          <br />
          <span className="text-gradient">Berpikir Kritis</span>
          <br />
          <span className="text-surface-50">dengan</span>{" "}
          <span className="text-gradient-accent">SANDIKA</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-surface-200/70 leading-relaxed mb-10"
        >
          Sandbox simulasi investigasi jurnalistik interaktif.
          Bongkar narasi menyesatkan menggunakan alat investigasi visual
          dan asisten AI Sokratik.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/sandbox" className="btn-primary text-base sm:text-lg flex items-center gap-2 !px-7 sm:!px-8 !py-3.5 sm:!py-4">
            <span className="flex items-center gap-2 font-semibold">
              <Target className="w-5 h-5" />
              Mulai Investigasi
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
          <Link href="/dashboard" className="btn-secondary text-base sm:text-lg flex items-center gap-2 !px-6 sm:!px-8 !py-3.5 sm:!py-4">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <span>Dashboard Pelajar</span>
          </Link>
          <Link href="/data-siswa" className="btn-secondary text-base sm:text-lg flex items-center gap-2 !px-6 sm:!px-8 !py-3.5 sm:!py-4 border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Semua Data Siswa</span>
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-20"
        >
          {[
            { icon: "📊", text: "Analisis Grafik" },
            { icon: "🔍", text: "Pelacakan Balik" },
            { icon: "✍️", text: "Sorot Falasi Logika" },
            { icon: "🤖", text: "Asisten AI Sokratik" },
          ].map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-surface-200/80"
            >
              <span>{pill.icon}</span>
              <span>{pill.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 h-8 rounded-lg bg-surface-800/80 flex items-center px-4">
                <span className="text-xs text-surface-200/50 font-mono">
                  sandika-app.vercel.app/sandbox
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-surface-900/60 rounded-xl p-4 border border-primary-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium text-primary-300">Panel Artikel</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-surface-800 rounded w-full" />
                  <div className="h-3 bg-surface-800 rounded w-5/6" />
                  <div className="h-3 bg-primary-500/20 rounded w-4/6 border border-primary-500/30" />
                  <div className="h-3 bg-surface-800 rounded w-full" />
                  <div className="h-3 bg-surface-800 rounded w-3/4" />
                </div>
              </div>
              <div className="bg-surface-900/60 rounded-xl p-4 border border-accent-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent-400" />
                  <span className="text-sm font-medium text-accent-300">Alat Investigasi</span>
                </div>
                <div className="space-y-3">
                  <div className="h-16 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-lg border border-primary-500/10 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="h-8 bg-surface-800 rounded-lg" />
                  <div className="h-8 bg-surface-800 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary-500/20 via-transparent to-accent-500/20 blur-xl -z-10" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-surface-200/30"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
