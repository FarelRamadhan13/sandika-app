"use client";

import { motion } from "framer-motion";
import { BarChart3, Search, Highlighter, Bot } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Analisis Grafik Manipulatif",
    description:
      "Ungkap manipulasi grafik yang menyembunyikan baseline zero. Lihat bagaimana data yang sama bisa menipu saat disajikan dengan skala yang salah.",
    gradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-500/20",
    bgGlow: "bg-blue-500/5",
  },
  {
    icon: Search,
    emoji: "🔍",
    title: "Pelacakan Balik Tiruan",
    description:
      "Verifikasi klaim ilmiah dan sumber kutipan dalam artikel fiktif. Temukan apakah professor dan institusi yang dikutip benar-benar ada.",
    gradient: "from-cyan-500 to-teal-600",
    borderColor: "border-cyan-500/20",
    bgGlow: "bg-cyan-500/5",
  },
  {
    icon: Highlighter,
    emoji: "✍️",
    title: "Sorot & Klasifikasi Falasi",
    description:
      "Identifikasi kecacatan logika tersembunyi dalam artikel. Sorot teks mencurigakan dan klasifikasikan jenis falasi logikanya.",
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/20",
    bgGlow: "bg-violet-500/5",
  },
  {
    icon: Bot,
    emoji: "🤖",
    title: "Asisten AI Sokratik",
    description:
      "Chatbot AI yang membimbing tanpa memberi jawaban langsung. Menggunakan Metode Sokratik untuk menuntun pemikiran kritis siswa.",
    gradient: "from-emerald-500 to-green-600",
    borderColor: "border-emerald-500/20",
    bgGlow: "bg-emerald-500/5",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
            Empat Alat{" "}
            <span className="text-gradient">Investigasi</span>
          </h2>
          <p className="max-w-2xl mx-auto text-surface-200/60 text-lg">
            Seperangkat alat visual interaktif yang dirancang untuk
            melatih kemampuan berpikir kritis dan literasi media siswa.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`glass-card rounded-2xl p-8 group relative overflow-hidden`}
              >
                {/* Background glow on hover */}
                <div
                  className={`absolute inset-0 ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl">{feature.emoji}</span>
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-semibold text-surface-50 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-surface-200/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
