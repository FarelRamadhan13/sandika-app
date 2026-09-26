"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, Brain, Award } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Baca Artikel Sintetis",
    description:
      "Siswa menerima artikel berita fiktif yang didesain dengan sengaja mengandung manipulasi data, falasi logika, dan sumber palsu.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    number: "02",
    icon: Target,
    title: "Investigasi dengan Alat Visual",
    description:
      "Gunakan 4 alat investigasi: analisis grafik, pelacakan balik, sorotan teks, dan reverse search untuk membongkar kebohongan.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    number: "03",
    icon: Brain,
    title: "Bimbingan AI Sokratik",
    description:
      "Saat menemui kebuntuan, tanyakan pada asisten AI yang akan membimbing dengan pertanyaan penuntun tanpa memberikan jawaban langsung.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    number: "04",
    icon: Award,
    title: "Evaluasi & Skor",
    description:
      "Sistem mengevaluasi akurasi identifikasi bias, kecepatan analisis, dan tingkat kemandirian siswa dalam investigasi.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32" id="how-it-works">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-radial" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
            Bagaimana{" "}
            <span className="text-gradient">SANDIKA</span> Bekerja?
          </h2>
          <p className="max-w-2xl mx-auto text-surface-200/60 text-lg">
            Empat langkah investigasi yang dirancang untuk melatih
            kemampuan berpikir kritis secara progresif.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/30 via-accent-500/20 to-transparent" />

          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div
                    className={`glass-card rounded-2xl p-6 text-center h-full`}
                  >
                    {/* Step number */}
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.bg} ${step.border} border mb-5`}
                    >
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>

                    {/* Number badge */}
                    <div className="text-xs font-bold text-primary-500/60 tracking-widest mb-2">
                      LANGKAH {step.number}
                    </div>

                    <h3 className="text-lg font-semibold text-surface-50 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-sm text-surface-200/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-surface-50 mb-2">
              Siap melatih kemampuan berpikir kritis?
            </h3>
            <p className="text-surface-200/60 mb-6">
              Mulai investigasi pertamamu dan temukan kebohongan tersembunyi.
            </p>
            <a
              href="/sandbox"
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>🔍 Mulai Sekarang</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
